// src/types.ts
export interface Vector3 {
    x: number;
    y: number;
    z: number;
  }
  
  export interface EulerAngles { // Roll, Pitch, Yaw in Radians
    x: number; // Pitch
    y: number; // Yaw
    z: number; // Roll
  }
  
  export interface BodyPartPose {
    rotation: EulerAngles;
    // position is relative to parent, managed by hierarchy
  }
  
  export interface MainBodyPose {
    position: Vector3;
    rotation: EulerAngles;
  }
  
  export interface HumanoidPose {
    body: MainBodyPose;
    head: BodyPartPose;
    leftShoulder: BodyPartPose; // Connection point, might not have its own mesh
    leftUpperArm: BodyPartPose;
    leftLowerArm: BodyPartPose;
    leftHand: BodyPartPose;
    rightShoulder: BodyPartPose;
    rightUpperArm: BodyPartPose;
    rightLowerArm: BodyPartPose;
    rightHand: BodyPartPose;
    leftHip: BodyPartPose; // Connection point
    leftUpperLeg: BodyPartPose;
    leftLowerLeg: BodyPartPose;
    leftFoot: BodyPartPose;
    rightHip: BodyPartPose;
    rightUpperLeg: BodyPartPose;
    rightLowerLeg: BodyPartPose;
    rightFoot: BodyPartPose;
  }
  
  // Constants for humanoid dimensions (adjust as needed)
  export const BODY_PART_SIZES = {
    headRadius: 0.3,
    torsoHeight: 1.2,
    torsoRadius: 0.25,
    limbRadius: 0.1,
    upperArmLength: 0.5,
    lowerArmLength: 0.45,
    handRadius: 0.15,
    upperLegLength: 0.6,
    lowerLegLength: 0.55,
    footRadius: 0.2, // Representing foot as a sphere for simplicity
    shoulderWidthOffset: 0.3, // Half of torsoRadius + limbRadius basically
    hipWidthOffset: 0.2,
  };