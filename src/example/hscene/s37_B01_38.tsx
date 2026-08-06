import { VnPlayer } from '../../vn';
import { s37_B01_38 } from '../../vn/scenes/s37/s37_B01_38';

export default function s37_B01_38Scene() {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', overflow: 'hidden' }}>
      <VnPlayer script={s37_B01_38} scriptKey="s37_B01_38" />
    </div>
  );
}
