import { ReactNode, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Download, X, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface PrintModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const printStyles = `
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { margin: 15mm; size: A4; }
    body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: white; color: #1a1a1a; }
  .print-header { display: flex; justify-content: space-between; margin-bottom: 24px; }
  .logo { display: flex; align-items: center; gap: 8px; }
  .logo-icon { width: 32px; height: 32px; color: #7c3aed; }
  .brand { font-size: 24px; font-weight: bold; color: #1a1a1a; }
  .subtitle { font-size: 12px; color: #666; }
  .doc-title { font-size: 28px; font-weight: bold; color: #7c3aed; }
  .doc-info { text-align: right; font-size: 12px; }
  .doc-info span { color: #666; }
  .separator { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 24px; }
  .section-title { font-size: 12px; font-weight: 600; color: #666; margin-bottom: 8px; text-transform: uppercase; }
  .name { font-weight: 500; color: #1a1a1a; }
  .detail { font-size: 14px; color: #666; }
  .info-box { background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
  .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; font-size: 14px; }
  .info-label { color: #666; }
  .info-value { font-weight: 500; font-family: monospace; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #e5e7eb; font-size: 14px; font-weight: 600; color: #1a1a1a; }
  th:last-child, td:last-child { text-align: right; }
  th:nth-child(2), th:nth-child(3), td:nth-child(2), td:nth-child(3) { text-align: center; }
  td { padding: 16px 8px; border-bottom: 1px solid #e5e7eb; color: #1a1a1a; }
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
  .payment-type { font-weight: 500; color: #1a1a1a; }
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
  .border { border: 1px solid #e5e7eb; }
  .rounded-lg { border-radius: 8px; }
  .p-4 { padding: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .text-primary { color: #7c3aed; }
  .text-green-600 { color: #16a34a; }
  .text-green-500 { color: #22c55e; }
  .text-blue-700 { color: #1d4ed8; }
  .text-amber-600 { color: #d97706; }
  .bg-green-50 { background: #f0fdf4; }
  .bg-green-100 { background: #dcfce7; }
  .bg-blue-100 { background: #dbeafe; }
  .bg-amber-50 { background: #fffbeb; }
  .bg-muted\\/50, .bg-muted\\/30 { background: #f9fafb; }
  .font-mono { font-family: ui-monospace, monospace; }
  .font-medium { font-weight: 500; }
  .font-bold { font-weight: 700; }
  .text-sm { font-size: 14px; }
  .text-xs { font-size: 12px; }
  .text-lg { font-size: 18px; }
  .text-xl { font-size: 20px; }
  .text-2xl { font-size: 24px; }
  .text-3xl { font-size: 30px; }
  svg { display: inline-block; vertical-align: middle; }
`;

export const PrintModal = ({ open, onClose, title, children }: PrintModalProps) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title} - HotelBook</title>
            <style>${printStyles}</style>
          </head>
          <body>
            <div class="print-container">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                }, 300);
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleOpenPrintPage = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title} - HotelBook</title>
            <style>${printStyles}</style>
          </head>
          <body>
            <div class="no-print" style="background: #f3f4f6; padding: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 18px; font-weight: 600; color: #1a1a1a;">${title}</div>
              <div style="display: flex; gap: 8px;">
                <button onclick="window.print()" style="background: #7c3aed; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                  Print
                </button>
                <button onclick="window.close()" style="background: #e5e7eb; color: #1a1a1a; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                  Close
                </button>
              </div>
            </div>
            <div class="print-container" style="max-width: 800px; margin: 0 auto; padding: 0 20px 40px;">
              ${printContent}
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
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
              <Button variant="outline" size="sm" onClick={handleOpenPrintPage}>
                <ExternalLink className="h-4 w-4 mr-1" /> Open
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-primary">
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div ref={printRef} className="bg-white dark:bg-card p-6 rounded-lg border">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
