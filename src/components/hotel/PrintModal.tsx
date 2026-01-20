import { ReactNode, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${title} - HotelBook`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm;
      }
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
        .print-content {
          page-break-inside: avoid;
          break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;

    const element = printRef.current;
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: `${title.replace(/\s+/g, "_")}_HotelBook.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".page-break-before",
        after: ".page-break-after",
        avoid: [".no-break", "tr", "thead", ".print-section"],
      },
    };

    try {
      toast.loading("Generating PDF...", { id: "pdf-download" });
      await html2pdf().set(opt).from(element).save();
      toast.success(`${title} downloaded successfully!`, { id: "pdf-download" });
    } catch (error) {
      toast.error("Failed to generate PDF", { id: "pdf-download" });
      console.error("PDF generation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>{title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button size="sm" onClick={() => handlePrint()} className="bg-primary">
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div 
          ref={printRef} 
          className="bg-white p-6 rounded-lg border print:p-0 print:border-0 print:rounded-none print:bg-white"
        >
          <PrintableContent>
            {children}
          </PrintableContent>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Separate printable content component for clean styling
const PrintableContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="print-content">
      <style>
        {`
          @media print {
            .print-content {
              width: 100% !important;
              max-width: none !important;
              font-size: 12px !important;
              color: #000 !important;
              background: #fff !important;
            }
            .print-content * {
              color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .no-break {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            table {
              page-break-inside: auto !important;
            }
            tr {
              page-break-inside: avoid !important;
              page-break-after: auto !important;
            }
            thead {
              display: table-header-group !important;
            }
            tfoot {
              display: table-footer-group !important;
            }
          }
        `}
      </style>
      {children}
    </div>
  );
};
