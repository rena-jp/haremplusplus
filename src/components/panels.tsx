import '../style/panels.css';

export interface PanelProps {
  visible: boolean;
  close(): void;
}
