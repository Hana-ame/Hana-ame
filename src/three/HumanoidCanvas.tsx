// src/components/HumanoidCanvas.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { HumanoidPose, BODY_PART_SIZES } from './types'; // Assuming types.ts is in src/
import type { EulerAngles } from './types';

interface HumanoidCanvasProps {
  pose: HumanoidPose;
}

const HumanoidCanvas: React.FC<HumanoidCanvasProps> = ({ pose }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Refs for body part groups to update them
  const bodyGroupRef = useRef<THREE.Group | null>(null);
  const headGroupRef = useRef<THREE.Group | null>(null);
  const leftShoulderRef = useRef<THREE.Group | null>(null);
  const leftUpperArmRef = useRef<THREE.Group | null>(null);
  const leftLowerArmRef = useRef<THREE.Group | null>(null);
  const leftHandRef = useRef<THREE.Group | null>(null);
  const rightShoulderRef = useRef<THREE.Group | null>(null);
  const rightUpperArmRef = useRef<THREE.Group | null>(null);
  const rightLowerArmRef = useRef<THREE.Group | null>(null);
  const rightHandRef = useRef<THREE.Group | null>(null);
  // ... (add refs for legs and feet similarly)
  const leftHipRef = useRef<THREE.Group | null>(null);
  const leftUpperLegRef = useRef<THREE.Group | null>(null);
  const leftLowerLegRef = useRef<THREE.Group | null>(null);
  const leftFootRef = useRef<THREE.Group | null>(null);
  const rightHipRef = useRef<THREE.Group | null>(null);
  const rightUpperLegRef = useRef<THREE.Group | null>(null);
  const rightLowerLegRef = useRef<THREE.Group | null>(null);
  const rightFootRef = useRef<THREE.Group | null>(null);


  // Helper to create a limb segment (cylinder) and its joint (sphere)
  const createLimbSegment = (
    length: number,
    radius: number,
    color: THREE.ColorRepresentation,
    name: string
  ): THREE.Group => {
    const group = new THREE.Group();
    group.name = name + "Group";

    const limbGeometry = new THREE.CylinderGeometry(radius, radius, length, 16);
    const limbMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 });
    const limbMesh = new THREE.Mesh(limbGeometry, limbMaterial);
    limbMesh.name = name + "Mesh";
    limbMesh.position.y = length / 2; // Pivot at the base of the cylinder
    group.add(limbMesh);

    // Optional: Add a sphere as a joint visualizer
    // const jointGeometry = new THREE.SphereGeometry(radius * 1.1, 16, 16);
    // const jointMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    // const jointMesh = new THREE.Mesh(jointGeometry, jointMaterial);
    // jointMesh.name = name + "Joint";
    // group.add(jointMesh); // Joint is at the origin of the group

    return group;
  };

  const createSpherePart = (
    radius: number,
    color: THREE.ColorRepresentation,
    name: string
  ): THREE.Group => {
    const group = new THREE.Group();
    group.name = name + "Group";
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name + "Mesh";
    group.add(mesh);
    return group;
  };


  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    sceneRef.current = new THREE.Scene();
    sceneRef.current.background = new THREE.Color(0x87ceeb); // Sky blue

    cameraRef.current = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    cameraRef.current.position.set(0, BODY_PART_SIZES.torsoHeight, 3); // Adjusted for humanoid scale

    rendererRef.current = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(rendererRef.current.domElement);

    controlsRef.current = new OrbitControls(cameraRef.current, rendererRef.current.domElement);
    controlsRef.current.target.set(0, BODY_PART_SIZES.torsoHeight / 2, 0); // Target center of torso
    controlsRef.current.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    sceneRef.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    sceneRef.current.add(directionalLight);

    // --- Build Humanoid ---
    bodyGroupRef.current = new THREE.Group(); // This will hold the entire humanoid
    bodyGroupRef.current.name = "HumanoidBody";
    sceneRef.current.add(bodyGroupRef.current);

    // Torso (main part of the bodyGroup)
    const torsoGeometry = new THREE.CylinderGeometry(BODY_PART_SIZES.torsoRadius, BODY_PART_SIZES.torsoRadius, BODY_PART_SIZES.torsoHeight, 16);
    const torsoMaterial = new THREE.MeshStandardMaterial({ color: 0x0088cc, roughness: 0.7, metalness: 0.3 });
    const torsoMesh = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torsoMesh.name = "TorsoMesh";
    torsoMesh.position.y = BODY_PART_SIZES.torsoHeight / 2; // Center it along Y
    bodyGroupRef.current.add(torsoMesh); // Torso mesh is directly in bodyGroup for body rotation

    // Head
    headGroupRef.current = createSpherePart(BODY_PART_SIZES.headRadius, 0xffccaa, "Head");
    headGroupRef.current.position.y = BODY_PART_SIZES.torsoHeight + BODY_PART_SIZES.headRadius * 0.8; // Position on top of torso
    torsoMesh.add(headGroupRef.current); // Head is child of torso for combined rotation

    // --- Arms ---
    // Left Arm
    leftShoulderRef.current = new THREE.Group();
    leftShoulderRef.current.name = "LeftShoulder";
    leftShoulderRef.current.position.set(-BODY_PART_SIZES.shoulderWidthOffset, BODY_PART_SIZES.torsoHeight * 0.9, 0);
    torsoMesh.add(leftShoulderRef.current);

    leftUpperArmRef.current = createLimbSegment(BODY_PART_SIZES.upperArmLength, BODY_PART_SIZES.limbRadius, 0xdd7777, "LeftUpperArm");
    // Upper arm pivots from its top, so its base is at 0,0,0 of its group
    leftShoulderRef.current.add(leftUpperArmRef.current);

    leftLowerArmRef.current = createLimbSegment(BODY_PART_SIZES.lowerArmLength, BODY_PART_SIZES.limbRadius * 0.9, 0xee8888, "LeftLowerArm");
    leftLowerArmRef.current.position.y = BODY_PART_SIZES.upperArmLength; // Connect to end of upper arm
    leftUpperArmRef.current.add(leftLowerArmRef.current);

    leftHandRef.current = createSpherePart(BODY_PART_SIZES.handRadius, 0xff9999, "LeftHand");
    leftHandRef.current.position.y = BODY_PART_SIZES.lowerArmLength; // Connect to end of lower arm
    leftLowerArmRef.current.add(leftHandRef.current);

    // Right Arm (similar structure)
    rightShoulderRef.current = new THREE.Group();
    rightShoulderRef.current.name = "RightShoulder";
    rightShoulderRef.current.position.set(BODY_PART_SIZES.shoulderWidthOffset, BODY_PART_SIZES.torsoHeight * 0.9, 0);
    torsoMesh.add(rightShoulderRef.current);

    rightUpperArmRef.current = createLimbSegment(BODY_PART_SIZES.upperArmLength, BODY_PART_SIZES.limbRadius, 0xdd7777, "RightUpperArm");
    rightShoulderRef.current.add(rightUpperArmRef.current);

    rightLowerArmRef.current = createLimbSegment(BODY_PART_SIZES.lowerArmLength, BODY_PART_SIZES.limbRadius * 0.9, 0xee8888, "RightLowerArm");
    rightLowerArmRef.current.position.y = BODY_PART_SIZES.upperArmLength;
    rightUpperArmRef.current.add(rightLowerArmRef.current);

    rightHandRef.current = createSpherePart(BODY_PART_SIZES.handRadius, 0xff9999, "RightHand");
    rightHandRef.current.position.y = BODY_PART_SIZES.lowerArmLength;
    rightLowerArmRef.current.add(rightHandRef.current);


    // --- Legs ---
    // Left Leg
    leftHipRef.current = new THREE.Group();
    leftHipRef.current.name = "LeftHip";
    leftHipRef.current.position.set(-BODY_PART_SIZES.hipWidthOffset, BODY_PART_SIZES.torsoHeight * 0.05, 0);
    torsoMesh.add(leftHipRef.current);

    leftUpperLegRef.current = createLimbSegment(BODY_PART_SIZES.upperLegLength, BODY_PART_SIZES.limbRadius, 0x77dd77, "LeftUpperLeg");
    leftHipRef.current.add(leftUpperLegRef.current);

    leftLowerLegRef.current = createLimbSegment(BODY_PART_SIZES.lowerLegLength, BODY_PART_SIZES.limbRadius * 0.9, 0x88ee88, "LeftLowerLeg");
    leftLowerLegRef.current.position.y = BODY_PART_SIZES.upperLegLength;
    leftUpperLegRef.current.add(leftLowerLegRef.current);

    leftFootRef.current = createSpherePart(BODY_PART_SIZES.footRadius, 0x99ff99, "LeftFoot");
    // Position foot slightly forward and at the end of the lower leg
    leftFootRef.current.position.set(0, BODY_PART_SIZES.lowerLegLength, BODY_PART_SIZES.footRadius * 0.5);
    leftLowerLegRef.current.add(leftFootRef.current);

    // Right Leg
    rightHipRef.current = new THREE.Group();
    rightHipRef.current.name = "RightHip";
    rightHipRef.current.position.set(BODY_PART_SIZES.hipWidthOffset, BODY_PART_SIZES.torsoHeight * 0.05, 0);
    torsoMesh.add(rightHipRef.current);

    rightUpperLegRef.current = createLimbSegment(BODY_PART_SIZES.upperLegLength, BODY_PART_SIZES.limbRadius, 0x77dd77, "RightUpperLeg");
    rightHipRef.current.add(rightUpperLegRef.current);

    rightLowerLegRef.current = createLimbSegment(BODY_PART_SIZES.lowerLegLength, BODY_PART_SIZES.limbRadius * 0.9, 0x88ee88, "RightLowerLeg");
    rightLowerLegRef.current.position.y = BODY_PART_SIZES.upperLegLength;
    rightUpperLegRef.current.add(rightLowerLegRef.current);

    rightFootRef.current = createSpherePart(BODY_PART_SIZES.footRadius, 0x99ff99, "RightFoot");
    rightFootRef.current.position.set(0, BODY_PART_SIZES.lowerLegLength, BODY_PART_SIZES.footRadius * 0.5);
    rightLowerLegRef.current.add(rightFootRef.current);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(10, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x66aa66, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    sceneRef.current.add(floor);


    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      controlsRef.current?.update();
      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    animate();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && currentMount) {
        cameraRef.current.aspect = currentMount.clientWidth / currentMount.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      // ... (standard cleanup: cancel animation, remove listener, dispose renderer, DOM element)
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      // Dispose geometries and materials if they are not reused
      // For simplicity, not explicitly disposing all geometries/materials here,
      // but in a larger app, you would track and dispose them.
      sceneRef.current?.traverse(object => {
        if (object instanceof THREE.Mesh) {
            object.geometry?.dispose();
            if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
            } else {
                object.material?.dispose();
            }
        }
      });
      controlsRef.current?.dispose();
      if (currentMount && rendererRef.current?.domElement) {
        currentMount.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []); // Initial setup

  // Effect to update pose
  useEffect(() => {
    if (!bodyGroupRef.current) return; // Not initialized yet

    // Body position and rotation
    bodyGroupRef.current.position.set(pose.body.position.x, pose.body.position.y, pose.body.position.z);
    // The main bodyGroup itself doesn't rotate. The torsoMesh inside it does.
    const torso = bodyGroupRef.current.getObjectByName("TorsoMesh");
    if (torso) {
        torso.rotation.set(pose.body.rotation.x, pose.body.rotation.y, pose.body.rotation.z);
    }


    // Helper to apply rotation
    const applyRotation = (groupRef: React.RefObject<THREE.Group | null>, rotation: EulerAngles) => {
      if (groupRef.current) {
        groupRef.current.rotation.set(rotation.x, rotation.y, rotation.z);
      }
    };

    applyRotation(headGroupRef, pose.head.rotation);

    applyRotation(leftShoulderRef, pose.leftShoulder.rotation);
    applyRotation(leftUpperArmRef, pose.leftUpperArm.rotation);
    applyRotation(leftLowerArmRef, pose.leftLowerArm.rotation);
    applyRotation(leftHandRef, pose.leftHand.rotation);

    applyRotation(rightShoulderRef, pose.rightShoulder.rotation);
    applyRotation(rightUpperArmRef, pose.rightUpperArm.rotation);
    applyRotation(rightLowerArmRef, pose.rightLowerArm.rotation);
    applyRotation(rightHandRef, pose.rightHand.rotation);

    applyRotation(leftHipRef, pose.leftHip.rotation);
    applyRotation(leftUpperLegRef, pose.leftUpperLeg.rotation);
    applyRotation(leftLowerLegRef, pose.leftLowerLeg.rotation);
    applyRotation(leftFootRef, pose.leftFoot.rotation);

    applyRotation(rightHipRef, pose.rightHip.rotation);
    applyRotation(rightUpperLegRef, pose.rightUpperLeg.rotation);
    applyRotation(rightLowerLegRef, pose.rightLowerLeg.rotation);
    applyRotation(rightFootRef, pose.rightFoot.rotation);


  }, [pose]); // Rerun when pose changes

  return <div ref={mountRef} style={{ width: '100%', height: '100%',  border: '1px solid black' }} />;
};

export default HumanoidCanvas;  