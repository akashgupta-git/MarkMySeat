import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-dark-card group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-white/5 group-[.toast]:text-gray-400",
          success: "group-[.toaster]:border-emerald-500/20",
          error: "group-[.toaster]:border-red-500/20",
        },
      }}
      position="top-right"
      richColors
      {...props}
    />
  );
};

export { Toaster };