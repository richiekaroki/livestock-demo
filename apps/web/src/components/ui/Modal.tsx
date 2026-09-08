import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { trapFocus, savePreviousActiveElement, generateAccessibleId } from '../../utils/accessibility';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const titleId = useRef(generateAccessibleId('modal-title'));
  const descriptionId = useRef(generateAccessibleId('modal-description'));

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      // Save previous active element
      previousActiveElementRef.current = savePreviousActiveElement();
      
      // Trap focus
      const cleanup = trapFocus(modalRef.current!, previousActiveElementRef.current || undefined);
      
      // Add escape key listener
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (cleanup) cleanup();
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
      aria-describedby={descriptionId.current}
    >
      <div
        ref={modalRef}
        className={`bg-bg-primary rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id={titleId.current} className="text-lg font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div id={descriptionId.current} className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
}