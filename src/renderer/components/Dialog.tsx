import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Dialog({ open, title, description, children, actions, onClose, onSubmit }: { open: boolean; title: string; description?: string; children: ReactNode; actions: ReactNode; onClose: () => void; onSubmit?: (event: FormEvent<HTMLFormElement>) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      window.setTimeout(() => {
        const target = dialog.querySelector<HTMLElement>("input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])");
        target?.focus();
      });
    }
    if (!open && dialog.open) dialog.close();
    return () => {
      const opener = openerRef.current;
      window.setTimeout(() => { if (opener?.isConnected) opener.focus(); });
    };
  }, [open]);
  return (
    <dialog ref={ref} className="app-dialog" aria-labelledby="dialog-title" aria-describedby={description ? "dialog-description" : undefined} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={onClose}>
      <form method="dialog" onSubmit={onSubmit}>
        <header><div><h2 id="dialog-title">{title}</h2>{description && <p id="dialog-description">{description}</p>}</div><button className="icon-button" type="button" onClick={onClose} aria-label={`Close ${title}`} title={`Close ${title}`}><Icon name="close" /></button></header>
        <div className="dialog-body">{children}</div><footer>{actions}</footer>
      </form>
    </dialog>
  );
}

export function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: ReactNode }) {
  return <label className="form-field"><span>{label}{required && <b aria-hidden="true"> *</b>}</span>{children}{error && <small className="field-error" role="alert">{error}</small>}</label>;
}
