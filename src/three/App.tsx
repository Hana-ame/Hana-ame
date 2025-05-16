// src/App.tsx
import React, { useState } from 'react';
import HumanoidCanvas from './HumanoidCanvas';
import { HumanoidPose, EulerAngles, Vector3 } from './types';
import './App.css'; // For styling controls

const initialPose: HumanoidPose = {
  body: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  head: { rotation: { x: 0, y: 0, z: 0 } },
  leftShoulder: { rotation: { x: 0, y: 0, z: 0 } }, // Yaw for shoulder shrug/forward, Pitch for up/down, Roll for twist
  leftUpperArm: { rotation: { x: -Math.PI / 6, y: 0, z: -Math.PI / 12 } }, // Slight natural bend
  leftLowerArm: { rotation: { x: Math.PI / 4, y: 0, z: 0 } },
  leftHand: { rotation: { x: 0, y: 0, z: 0 } },
  rightShoulder: { rotation: { x: 0, y: 0, z: 0 } },
  rightUpperArm: { rotation: { x: -Math.PI / 6, y: 0, z: Math.PI / 12 } },
  rightLowerArm: { rotation: { x: Math.PI / 4, y: 0, z: 0 } },
  rightHand: { rotation: { x: 0, y: 0, z: 0 } },
  leftHip: { rotation: {x:0, y:0, z: Math.PI / 18} }, // Slight outward rotation for legs
  leftUpperLeg: { rotation: {x: Math.PI / 12, y:0, z:0}},
  leftLowerLeg: { rotation: {x: -Math.PI / 8, y:0, z:0}},
  leftFoot: { rotation: {x: Math.PI / 6, y:0, z:0}}, // Point foot slightly down
  rightHip: { rotation: {x:0, y:0, z: -Math.PI / 18} },
  rightUpperLeg: { rotation: {x: Math.PI / 12, y:0, z:0}},
  rightLowerLeg: { rotation: {x: -Math.PI / 8, y:0, z:0}},
  rightFoot: { rotation: {x: Math.PI / 6, y:0, z:0}},
};

// Helper to convert degrees to radians for UI
const degToRad = (degrees: number) => degrees * (Math.PI / 180);
const radToDeg = (radians: number) => radians * (180 / Math.PI);

const App: React.FC = () => {
  const [pose, setPose] = useState<HumanoidPose>(initialPose);

  const handleBodyPositionChange = (axis: keyof Vector3, value: string) => {
    setPose(prev => ({
      ...prev,
      body: {
        ...prev.body,
        position: { ...prev.body.position, [axis]: parseFloat(value) }
      }
    }));
  };

  const handleRotationChange = (
    part: keyof Omit<HumanoidPose, 'body'> | 'bodyRotation', // 'bodyRotation' to distinguish from body.position
    axis: keyof EulerAngles,
    value: string
  ) => {
    const radians = degToRad(parseFloat(value));
    setPose(prev => {
      if (part === 'bodyRotation') {
        return {
          ...prev,
          body: { ...prev.body, rotation: { ...prev.body.rotation, [axis]: radians } }
        };
      }
      const partToUpdate = prev[part as keyof Omit<HumanoidPose, 'body'>];
      return {
        ...prev,
        [part]: {
          ...partToUpdate,
          rotation: { ...partToUpdate.rotation, [axis]: radians }
        }
      };
    });
  };

  const renderRotationControls = (partName: keyof Omit<HumanoidPose, 'body'> | 'bodyRotation', currentRotation: EulerAngles) => {
    const labelPrefix = partName === 'bodyRotation' ? 'Body' : partName.toString();
    return (
      <div className="control-group">
        <strong>{labelPrefix} Rotation:</strong>
        {(['x', 'y', 'z'] as Array<keyof EulerAngles>).map(axis => (
          <label key={axis}>
            {axis.toUpperCase()} (Pitch/Yaw/Roll):
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={radToDeg(currentRotation[axis])}
              onChange={(e) => handleRotationChange(partName, axis, e.target.value)}
            />
            {radToDeg(currentRotation[axis]).toFixed(0)}°
          </label>
        ))}
      </div>
    );
  };

  return (
    <div className="App">
      <div className="controls-panel">
        <h3>Humanoid Controls</h3>
        <div className="control-group">
          <strong>Body Position:</strong>
          {(['x', 'y', 'z'] as Array<keyof Vector3>).map(axis => (
            <label key={axis}>
              {axis.toUpperCase()}:
              <input
                type="number"
                step="0.1"
                value={pose.body.position[axis]}
                onChange={(e) => handleBodyPositionChange(axis, e.target.value)}
              />
            </label>
          ))}
        </div>
        {renderRotationControls('bodyRotation', pose.body.rotation)}
        {renderRotationControls('head', pose.head.rotation)}
        {/* Add more controls systematically */}
        <h4>Left Arm</h4>
        {renderRotationControls('leftShoulder', pose.leftShoulder.rotation)}
        {renderRotationControls('leftUpperArm', pose.leftUpperArm.rotation)}
        {renderRotationControls('leftLowerArm', pose.leftLowerArm.rotation)}
        {renderRotationControls('leftHand', pose.leftHand.rotation)}
         <h4>Right Arm</h4>
        {renderRotationControls('rightShoulder', pose.rightShoulder.rotation)}
        {renderRotationControls('rightUpperArm', pose.rightUpperArm.rotation)}
        {renderRotationControls('rightLowerArm', pose.rightLowerArm.rotation)}
        {renderRotationControls('rightHand', pose.rightHand.rotation)}
        <h4>Left Leg</h4>
        {renderRotationControls('leftHip', pose.leftHip.rotation)}
        {renderRotationControls('leftUpperLeg', pose.leftUpperLeg.rotation)}
        {renderRotationControls('leftLowerLeg', pose.leftLowerLeg.rotation)}
        {renderRotationControls('leftFoot', pose.leftFoot.rotation)}
        <h4>Right Leg</h4>
        {renderRotationControls('rightHip', pose.rightHip.rotation)}
        {renderRotationControls('rightUpperLeg', pose.rightUpperLeg.rotation)}
        {renderRotationControls('rightLowerLeg', pose.rightLowerLeg.rotation)}
        {renderRotationControls('rightFoot', pose.rightFoot.rotation)}

        <button onClick={() => setPose(initialPose)} style={{marginTop: '20px'}}>Reset Pose</button>
      </div>
      <div className="canvas-container">
        <HumanoidCanvas pose={pose} />
      </div>
    </div>
  );
};

export default App;