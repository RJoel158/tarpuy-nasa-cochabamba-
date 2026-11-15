import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 duration-100 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
        className
      )}
      style={{ backgroundColor: "rgba(35, 26, 20, 0.65)", ...(props.style || {}) }}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "tarpuy-card-physical fixed z-50 grid w-full gap-4 p-5 text-base outline-none duration-100",
          "left-1/2 top-auto bottom-0 max-h-[88vh] -translate-x-1/2 translate-y-0 rounded-t-3xl sm:top-1/2 sm:bottom-auto sm:max-w-lg sm:-translate-y-1/2 sm:rounded-3xl",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          className
        )}
        style={{
          backgroundColor: "var(--tarjeta)",
          color: "var(--tinta)",
          border: "2px solid var(--tinta)",
          boxShadow: "0 8px 0 var(--tinta)",
          ...(props.style || {}),
        }}
        {...props}
      >
        {children}
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3 right-3 min-h-12 min-w-12 rounded-2xl"
                size="icon-lg"
                style={{
                  backgroundColor: "var(--arena)",
                  color: "var(--tinta)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              />
            }
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 pr-12", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, showCloseButton = false, children, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 border-t p-0 pt-4 sm:flex-row sm:justify-end",
        className
      )}
      style={{ borderColor: "var(--tinta)" }}
      {...props}
    >
      {children}
      {showCloseButton ? (
        <DialogPrimitive.Close
          render={
            <Button
              variant="outline"
              className="min-h-16 rounded-2xl text-base font-extrabold"
              style={{
                backgroundColor: "var(--hoja-oscura)",
                color: "var(--tarjeta)",
                border: "2px solid var(--tinta)",
              }}
            />
          }
        >
          Close
        </DialogPrimitive.Close>
      ) : null}
    </div>
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-extrabold text-xl leading-tight", className)}
      style={{ color: "var(--tinta)" }}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-base font-bold leading-relaxed", className)}
      style={{ color: "var(--tinta-suave)" }}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
