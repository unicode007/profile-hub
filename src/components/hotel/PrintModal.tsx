import { ReactNode, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X } from "lucide-react";
import { toast } from "sonner";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const PrintModal = ({ open, onClose, title, children }: PrintModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              .print-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
              .logo { display: flex; align-items: center; gap: 8px; }
              .logo-icon { width: 32px; height: 32px; color: #7c3aed; }
              .brand { font-size: 24px; font-weight: bold; }
              .subtitle { font-size: 12px; color: #666; }
              .doc-title { font-size: 28px; font-weight: bold; color: #7c3aed; }
              .doc-info { text-align: right; font-size: 12px; }
              .doc-info span { color: #666; }
              .separator { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
              .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
              .section-title { font-size: 12px; font-weight: 600; color: #666; margin-bottom: 8px; text-transform: uppercase; }
              .name { font-weight: 500; }
              .detail { font-size: 14px; color: #666; }
              .info-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
              .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-size: 14px; }
              .info-label { color: #666; }
              .info-value { font-weight: 500; font-family: monospace; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
              th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-size: 14px; font-weight: 600; }
              th:last-child, td:last-child { text-align: right; }
              th:nth-child(2), th:nth-child(3), td:nth-child(2), td:nth-child(3) { text-align: center; }
              td { padding: 16px 8px; border-bottom: 1px solid #e5e7eb; }
              .item-name { font-weight: 500; }
              .item-detail { font-size: 14px; color: #666; }
              .item-small { font-size: 12px; color: #666; }
              .totals { display: flex; justify-content: flex-end; }
              .totals-box { width: 256px; }
              .total-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; }
              .total-label { color: #666; }
              .total-final { font-size: 18px; font-weight: bold; }
              .total-final .amount { color: #7c3aed; }
              .payment-box { margin-top: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; display: flex; justify-content: space-between; }
              .payment-method { font-size: 12px; color: #666; }
              .payment-type { font-weight: 500; }
              .payment-status { color: #16a34a; font-weight: 500; font-size: 14px; }
              .payment-date { font-size: 12px; color: #666; }
              .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #666; }
              .receipt-stamp { text-align: center; margin: 32px 0; padding: 16px; border: 2px dashed #16a34a; border-radius: 8px; }
              .stamp-text { color: #16a34a; font-size: 24px; font-weight: bold; }
              .stamp-date { color: #666; font-size: 12px; }
              .confirmation-badge { background: #7c3aed; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
              .qr-placeholder { width: 100px; height: 100px; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; }
              .folio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
              .guest-signature { margin-top: 48px; border-top: 1px solid #000; width: 200px; padding-top: 8px; font-size: 12px; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }
    }
  };

  const handleDownload = () => {
    toast.success(`${title} downloaded as PDF`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="bg-white dark:bg-card p-6 rounded-lg">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
