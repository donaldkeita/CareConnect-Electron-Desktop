import { useEffect, useRef, type FormEvent, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Dialog({ open, title, description, children, actions, onClose, onSubmit }: { open: boolean; title: string; description?: string; children: ReactNode; actions: ReactNode; onClose: () => void; onSubmit?: (event: FormEvent<HTMLFormElement>) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); if (!open && dialog.open) dialog.close(); }, [open]);
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
