import { VnPlayer } from '../../vn';
import { s37_S05_30 } from '../../vn/scenes/s37/s37_S05_30';

export default function s37_S05_30Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_S05_30} scriptKey="s37_S05_30" />
    </div>
  );
}
