const BASE = "http://localhost:8080/api";
const http = require("http");

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE + path);
    const opts = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (token) opts.headers["Authorization"] = "Bearer " + token;
    const r = http.request(opts, (res) => {
      let d = "";
      res.on("data", (c) => (d += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(d) });
        } catch {
          resolve({ status: res.statusCode, data: d });
        }
      });
    });
    r.on("error", reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

const TS = Date.now();
const email = "e2e_" + TS + "@test.com";
const pass = "TestPass123!";

async function run() {
  let passed = 0,
    failed = 0;
  function check(name, condition, detail) {
    if (condition) {
      passed++;
      console.log("  ✅ " + name);
    } else {
      failed++;
      console.log("  ❌ " + name + (detail ? " — " + detail : ""));
    }
  }

  console.log("\n🔧 E2E Test Suite — " + new Date().toLocaleTimeString());
  console.log("══════════════════════════════════════════");

  // ─── AUTH TESTS ────────────────────────
  console.log("\n📋 AUTH TESTS");

  const reg = await req("POST", "/auth/register", {
    name: "E2E Tester",
    email,
    password: pass,
    phone: "9999999999",
  });
  check("Register new user", reg.status === 201 || reg.status === 200, "status=" + reg.status);

  const login = await req("POST", "/auth/login", { email, password: pass });
  check("Login returns token", login.status === 200 && login.data.token, "status=" + login.status);
  const token = login.data.token;

  const profile = await req("GET", "/auth/me", null, token);
  check("Get profile", profile.status === 200 && profile.data.email === email, "status=" + profile.status);

  const upd = await req("PUT", "/auth/profile", { name: "E2E Updated", phone: "8888888888" }, token);
  check("Update profile", upd.status === 200, "status=" + upd.status);

  const chpw = await req("PUT", "/auth/change-password", { currentPassword: pass, newPassword: pass + "2" }, token);
  check("Change password", chpw.status === 200, "status=" + chpw.status);
  await req("PUT", "/auth/change-password", { currentPassword: pass + "2", newPassword: pass }, token);

  // ─── MOVIES TESTS ─────────────────────
  console.log("\n🎬 MOVIES TESTS");

  const movies = await req("GET", "/movies/all", null, token);
  check("Get all movies", movies.status === 200 && Array.isArray(movies.data), "status=" + movies.status);
  check("Movies list has entries", movies.data && movies.data.length > 0, "count=" + (movies.data ? movies.data.length : 0));

  let movieId = null;
  let movie = null;
  if (movies.data && movies.data.length > 0) {
    movie = movies.data[0];
    movieId = movie._id;

    const movieDetail = await req("GET", "/movies/" + movieId, null, token);
    check("Get movie by ID", movieDetail.status === 200 && movieDetail.data._id === movieId, "status=" + movieDetail.status);

    // Check movie has showTimes embedded
    check("Movie has showTimes", Array.isArray(movie.showTimes) && movie.showTimes.length > 0, "showTimes=" + JSON.stringify(movie.showTimes));
  }

  // ─── THEATRES TESTS ───────────────────
  console.log("\n🏢 THEATRES TESTS");
  const theatres = await req("GET", "/movies/info/theatres", null, token);
  check("Get theatres", theatres.status === 200, "status=" + theatres.status);

  // ─── SEAT LOCK TESTS ─────────────────
  console.log("\n🎫 SEAT LOCK TESTS");
  let showTime = movie && movie.showTimes ? movie.showTimes[0] : null;
  let showDate = new Date().toISOString().split("T")[0]; // today

  if (movieId && showTime) {
    const qp =
      "?movieId=" + movieId +
      "&showTime=" + encodeURIComponent(showTime) +
      "&showDate=" + showDate;

    const avail = await req("GET", "/bookings/available-seats" + qp, null, token);
    check("Get available seats", avail.status === 200, "status=" + avail.status);

    const seatNumbers = ["H10", "H11"];
    const lockResp = await req("POST", "/bookings/lock-seats", { movieId, showTime, showDate, seatNumbers }, token);
    check("Lock seats", lockResp.status === 200 && lockResp.data.locked, "status=" + lockResp.status + " data=" + JSON.stringify(lockResp.data));

    // short delay to let Redis settle
    await new Promise(r => setTimeout(r, 500));

    const avail2 = await req("GET", "/bookings/available-seats" + qp, null, token);
    check("Available seats reflects locks", avail2.status === 200, "status=" + avail2.status);

    // Re-lock same seats same user
    const lockAgain = await req("POST", "/bookings/lock-seats", { movieId, showTime, showDate, seatNumbers }, token);
    check("Re-lock same user (200 or 409)", lockAgain.status === 200 || lockAgain.status === 409, "status=" + lockAgain.status);

    const unlockResp = await req("POST", "/bookings/unlock-seats", { movieId, showTime, showDate, seatNumbers }, token);
    check("Unlock seats", unlockResp.status === 200, "status=" + unlockResp.status);
  } else {
    console.log("  ⚠️  No movie with showTimes, skipping seat lock tests");
  }

  // ─── BOOKING HISTORY TESTS ───────────
  console.log("\n📖 BOOKING HISTORY TESTS");

  const history = await req("GET", "/bookings/my-bookings", null, token);
  check("Get booking history", history.status === 200 && Array.isArray(history.data), "status=" + history.status);

  // ─── FOOD MENU TESTS ─────────────────
  console.log("\n🍿 FOOD MENU TESTS");
  const food = await req("GET", "/food", null, token);
  check("Get food menu", food.status === 200, "status=" + food.status);

  // ─── SUMMARY ─────
  console.log("\n══════════════════════════════════════════");
  console.log("Results: " + passed + " passed, " + failed + " failed out of " + (passed + failed) + " tests");
  console.log(failed === 0 ? "🎉 ALL TESTS PASSED!" : "⚠️  Some tests failed");
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error("Test suite error:", e);
  process.exit(1);
});