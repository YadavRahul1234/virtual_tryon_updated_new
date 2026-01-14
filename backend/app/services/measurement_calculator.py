"""Measurement calculation service."""
import numpy as np
import math
from typing import Dict, List, Optional, Tuple
from app.services.pose_detector import PoseLandmark


class MeasurementCalculator:
    """Calculate anthropometric measurements from pose landmarks."""
    
    # Standard Anthropometric Ratios (Measurement / Height)
    # References: NHANES data, Pheasant's 'Bodyspace'
    ANTHROPOMETRIC_RATIOS = {
        'male': {
            'shoulder_width': 0.29, # Increased to 0.29 (approx 52-54cm for 180cm height) for XL/XXL support
            'chest': 0.55,
            'waist': 0.48,
            'hip': 0.54,
            'inseam': 0.45
        },
        'female': {
            'shoulder_width': 0.21,
            'chest': 0.53,
            'waist': 0.44,
            'hip': 0.58,
            'inseam': 0.44
        }
    }
    
    @staticmethod
    def calculate_distance(point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """
        Calculate Euclidean distance between two points.
        
        Args:
            point1: (x, y) coordinates
            point2: (x, y) coordinates
            
        Returns:
            Distance in pixels
        """
        return math.sqrt((point2[0] - point1[0])**2 + (point2[1] - point1[1])**2)
    
    @staticmethod
    def pixels_to_cm(pixels: float, calibration_factor: float) -> float:
        """
        Convert pixels to centimeters using calibration factor.
        
        Args:
            pixels: Distance in pixels
            calibration_factor: Pixels per cm
            
        Returns:
            Distance in cm
        """
        return pixels / calibration_factor
    
    @staticmethod
    def cm_to_inches(cm: float) -> float:
        """Convert centimeters to inches."""
        return cm / 2.54
    
    def calculate_calibration_factor(
        self,
        landmarks: List[Dict],
        image_height: int,
        actual_height_cm: float,
        segmentation_mask: Optional[np.ndarray] = None
    ) -> Optional[float]:
        """
        Calculate pixels-per-cm calibration factor using known height.
        Uses multi-stage fallback:
        1. Full Body (Top of head to Ankles)
        2. Torso-based (Shoulders to Hips) if legs are missing or cut off.
        """
        # Get key landmarks
        l_ankle = self._get_landmark_point(landmarks, PoseLandmark.LEFT_ANKLE, 1, image_height)
        r_ankle = self._get_landmark_point(landmarks, PoseLandmark.RIGHT_ANKLE, 1, image_height)
        l_shoulder = self._get_landmark_point(landmarks, PoseLandmark.LEFT_SHOULDER, 1, image_height)
        r_shoulder = self._get_landmark_point(landmarks, PoseLandmark.RIGHT_SHOULDER, 1, image_height)
        l_hip = self._get_landmark_point(landmarks, PoseLandmark.LEFT_HIP, 1, image_height)
        r_hip = self._get_landmark_point(landmarks, PoseLandmark.RIGHT_HIP, 1, image_height)
        
        # 1. PRIMARY: Full Body Calibration
        # Only use ankles if they are well within the image (not cut off)
        ankle_y = None
        if l_ankle and r_ankle:
            ankle_y = (l_ankle[1] + r_ankle[1]) / 2
        elif l_ankle:
            ankle_y = l_ankle[1]
        elif r_ankle:
            ankle_y = r_ankle[1]

        # Check if ankles are too close to the bottom (likely cut off)
        is_cutoff = False
        if ankle_y is not None and ankle_y > image_height * 0.96:
            is_cutoff = True

        if ankle_y and not is_cutoff:
            # Find top of head
            top_y = None
            if segmentation_mask is not None:
                mask_indices = np.where(segmentation_mask > 0.5)
                if len(mask_indices[0]) > 0:
                    top_y = np.min(mask_indices[0])
            
            if top_y is None:
                nose = self._get_landmark_point(landmarks, PoseLandmark.NOSE, 1, image_height)
                if nose:
                    top_y = nose[1] - (abs(ankle_y - nose[1]) * 0.12)
            
            if top_y is not None:
                height_pixels = abs(ankle_y - top_y)
                if height_pixels > 0:
                    return height_pixels / actual_height_cm

        # 2. SECONDARY: Torso-based Calibration (Fallback for cut-off or partial shots)
        # Ratio: Shoulder-to-Hip vertical distance is ~28% of total height
        if l_shoulder and r_shoulder and l_hip and r_hip:
            shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2
            hip_y = (l_hip[1] + r_hip[1]) / 2
            torso_pixels = abs(hip_y - shoulder_y)
            
            # Torso height (shoulder skip to hip skip) is typically 0.28 of stature
            estimated_cf = torso_pixels / (actual_height_cm * 0.28)
            return estimated_cf
            
        return None
    
    def _get_landmark_point(
        self,
        landmarks: List[Dict],
        index: int,
        image_width: int,
        image_height: int
    ) -> Optional[Tuple[float, float]]:
        """Get landmark coordinates."""
        if index >= len(landmarks):
            return None
        
        landmark = landmarks[index]
        
        if landmark['visibility'] < 0.65:
            return None
        
        x = landmark['x'] * image_width
        y = landmark['y'] * image_height
        
        return (x, y)

    def _get_body_dimension_at_y(
        self,
        segmentation_mask: np.ndarray,
        y_px: int,
        image_width: int,
        center_x: Optional[float] = None,
        min_x: Optional[float] = None,
        max_x: Optional[float] = None
    ) -> float:
        """
        Calculate the width/depth of the body silhouette at a specific Y-coordinate.
        
        Args:
            segmentation_mask: MediaPipe segmentation mask
            y_px: Y-coordinate in pixels
            image_width: Image width in pixels
            center_x: Optional center X to search around
            min_x: Optional minimum X to consider
            max_x: Optional maximum X to consider
            
        Returns:
            Dimension in pixels
        """
        if segmentation_mask is None or y_px < 0 or y_px >= segmentation_mask.shape[0]:
            return 0
        
        # Get the mask row at y
        row = segmentation_mask[int(y_px), :]
        
        # Apply X constraints if provided
        if min_x is not None or max_x is not None:
            constrained_row = np.zeros_like(row)
            start = int(max(0, min_x if min_x is not None else 0))
            end = int(min(image_width, max_x if max_x is not None else image_width))
            constrained_row[start:end] = row[start:end]
            row = constrained_row
        
        # Find pixels where mask > 0.7 (higher threshold for better accuracy)
        body_pixels = np.where(row > 0.7)[0]
        
        if len(body_pixels) < 2:
            return 0
        
        if center_x is not None:
            # Find all continuous segments
            diff = np.diff(body_pixels)
            breaks = np.where(diff > 5)[0] # 5 pixel gap is a break
            segments = np.split(body_pixels, breaks + 1)
            
            # Filter out very small segments (noise) - must be at least 2% of image width
            min_seg_size = max(2, int(image_width * 0.02))
            valid_segments = [seg for seg in segments if len(seg) >= min_seg_size]
            
            if not valid_segments:
                return 0
                
            # Find segment containing center_x or closest to it
            for seg in valid_segments:
                if seg[0] <= center_x <= seg[-1]:
                    return float(seg[-1] - seg[0])
            
            # If no segment contains center_x, take the largest one within reasonable distance
            best_seg = max(valid_segments, key=len)
            return float(best_seg[-1] - best_seg[0])

        # Fallback: take largest segment
        diff = np.diff(body_pixels)
        breaks = np.where(diff > 5)[0]
        segments = np.split(body_pixels, breaks + 1)
        largest_seg = max(segments, key=len)
        return float(largest_seg[-1] - largest_seg[0])

    def _calculate_circumference(self, width: float, depth: float) -> float:
        """
        Calculate circumference using Ramanujan's approximation for an ellipse.
        
        Args:
            width: Body width in cm
            depth: Body depth in cm
            
        Returns:
            Circumference in cm
        """
        if width <= 0 or depth <= 0:
            return 0
            
        a = width / 2
        b = depth / 2
        
        # Ramanujan's approximation
        h = ((a - b) ** 2) / ((a + b) ** 2)
        circumference = math.pi * (a + b) * (1 + (3 * h) / (10 + math.sqrt(4 - 3 * h)))
        
        return circumference
    
    def _get_anthropometric_estimate(self, height_cm: float, gender: str) -> Dict[str, float]:
        """
        Get estimated measurements based on height and gender.
        """
        gender = gender.lower() if gender else 'male'
        if gender not in self.ANTHROPOMETRIC_RATIOS:
            gender = 'male'
            
        ratios = self.ANTHROPOMETRIC_RATIOS[gender]
        return {
            name: height_cm * ratio
            for name, ratio in ratios.items()
        }

    def calculate_measurements(
        self,
        front_landmarks: Dict,
        side_landmarks: Optional[Dict],
        calibration_height_cm: float,
        units: str = "metric",
        gender: str = "male"
    ) -> Dict:
        """
        Calculate all body measurements using segmentation and ellipse approximation.
        """
        measurements = {}
        
        # Get calibration factor from front view using segmentation mask for top of head
        calibration_factor = self.calculate_calibration_factor(
            front_landmarks['landmarks'],
            front_landmarks['image_height'],
            calibration_height_cm,
            segmentation_mask=front_landmarks.get('segmentation_mask')
        )
        
        if not calibration_factor:
            return measurements
        
        # Front view data
        f_lms = front_landmarks['landmarks']
        f_mask = front_landmarks.get('segmentation_mask')
        f_w = front_landmarks['image_width']
        f_h = front_landmarks['image_height']
        
        # Side view data
        s_lms = side_landmarks['landmarks'] if side_landmarks else None
        s_mask = side_landmarks.get('segmentation_mask') if side_landmarks else None
        s_w = side_landmarks['image_width'] if side_landmarks else 0
        s_h = side_landmarks['image_height'] if side_landmarks else 0
        
        # Get key landmarks (front)
        l_shoulder = self._get_landmark_point(f_lms, PoseLandmark.LEFT_SHOULDER, f_w, f_h)
        r_shoulder = self._get_landmark_point(f_lms, PoseLandmark.RIGHT_SHOULDER, f_w, f_h)
        l_hip = self._get_landmark_point(f_lms, PoseLandmark.LEFT_HIP, f_w, f_h)
        r_hip = self._get_landmark_point(f_lms, PoseLandmark.RIGHT_HIP, f_w, f_h)
        nose = self._get_landmark_point(f_lms, PoseLandmark.NOSE, f_w, f_h)
        l_ankle = self._get_landmark_point(f_lms, PoseLandmark.LEFT_ANKLE, f_w, f_h)
        r_ankle = self._get_landmark_point(f_lms, PoseLandmark.RIGHT_ANKLE, f_w, f_h)
        
        # Check if ankles are cut off (at/near bottom edge)
        is_cutoff = False
        if l_ankle and r_ankle:
            avg_y = (l_ankle[1] + r_ankle[1]) / 2
            if avg_y > f_h * 0.96:
                is_cutoff = True
        elif l_ankle or r_ankle:
            y = l_ankle[1] if l_ankle else r_ankle[1]
            if y > f_h * 0.96:
                is_cutoff = True
        
        if not (l_shoulder and r_shoulder and l_hip and r_hip):
            return measurements

        # Calculate center X for front view (needed for shoulder and circumference measurements)
        f_center_x = (l_shoulder[0] + r_shoulder[0]) / 2
        
        # Calculate torso width for front view (needed for scan bounds)
        f_torso_width_px = abs(l_shoulder[0] - r_shoulder[0])

        # 1. Shoulder Width (use segmentation mask for outer shoulder edges, not just skeleton)
        # Previously used skeletal distance which is too narrow for clothing fit
        # Now use the actual body width at shoulder level for accurate shirt sizing
        # 1. Shoulder Width (use segmentation mask for outer shoulder edges, not just skeleton)
        shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2
        
        # Calculate torso stats early for scanning usage
        hip_y = (l_hip[1] + r_hip[1]) / 2
        torso_height = hip_y - shoulder_y
        
        # SCAN: Search for widest point in upper arm/deltoid region
        # Acromion is bone tip, but deltoids stick out lower.
        # Scan from shoulder level down to 15% of torso height
        scan_range_sh = int(torso_height * 0.15)
        sh_start = int(shoulder_y)
        sh_end = int(shoulder_y + scan_range_sh)
        
        shoulder_widths = []
        # Calculate reasonable bounds for shoulder search
        # Should be around center +/- (torso width * 0.8 to 1.5)
        sh_min_x = f_center_x - f_torso_width_px * 1.5
        sh_max_x = f_center_x + f_torso_width_px * 1.5
        
        for sy in range(sh_start, sh_end + 1):
            w = self._get_body_dimension_at_y(f_mask, sy, f_w, center_x=f_center_x, min_x=sh_min_x, max_x=sh_max_x)
            if w > 0:
                shoulder_widths.append(w)
        
        if shoulder_widths:
            shoulder_width_px = max(shoulder_widths) # Take max width (bi-deltoid)
        else:
            shoulder_width_px = self._get_body_dimension_at_y(
                f_mask, int(shoulder_y), f_w, center_x=f_center_x
            )
        
        # Apply correction: We want garment/bi-deltoid width
        shoulder_width_cm = self.pixels_to_cm(shoulder_width_px, calibration_factor)
        measurements['shoulder_width'] = shoulder_width_cm
        
        # 2. Height (use the same logic as calibration for consistency)
        ankle_y = (l_ankle[1] + r_ankle[1]) / 2 if (l_ankle and r_ankle) else (l_ankle[1] if l_ankle else r_ankle[1] if r_ankle else f_h)
        top_y = None
        if f_mask is not None:
            mask_indices = np.where(f_mask > 0.5)
            if len(mask_indices[0]) > 0:
                top_y = np.min(mask_indices[0])
        
        if top_y is None:
            top_y = nose[1] - (abs(ankle_y - nose[1]) * 0.12) if nose else 0
            
        height_px = abs(ankle_y - top_y)
        measurements['height'] = self.pixels_to_cm(height_px, calibration_factor)

        # Define vertical levels (Y-coordinates)
        # shoulder_y and hip_y, torso_height already calculated above
        
        # Refined Ratios (Anthropometric standards)
        if gender == 'female':
            # Females usually have higher waist levels and lower hip levels relative to torso
            chest_ratio = 0.30
            waist_ratio = 0.65
            hip_ratio = 1.05 # Slightly below the hip landmarks
        else:
            chest_ratio = 0.28
            waist_ratio = 0.62
            hip_ratio = 1.0
            
        # Initial levels
        chest_y = shoulder_y + torso_height * chest_ratio
        waist_y_base = shoulder_y + torso_height * waist_ratio
        hip_y_base = shoulder_y + torso_height * hip_ratio
        
        levels = {
            'chest': chest_y,
            'waist': waist_y_base,
            'hip': hip_y_base
        }
        
        # Default depth-to-width ratios if side view is missing
        default_depth_ratios = {
            'chest': 0.75 if gender == 'male' else 0.7,
            'waist': 0.8 if gender == 'male' else 0.75,
            'hip': 0.85 if gender == 'male' else 0.8
        }
        
        # Clothing allowance factors (ease subtraction)
        # We subtract a bit more for depth as clothes/hair often inflate it more
        width_correction = 0.96 # 4% ease subtraction
        depth_correction = 0.94 # 6% ease subtraction
        
        # f_torso_width_px already calculated above

        # 1. Shoulder Width (use segmentation mask for outer shoulder edges, not just skeleton)
        shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2

        # Calculate center X and torso bounds for side view
        s_center_x = 0
        if side_landmarks:
            s_l_shoulder = self._get_landmark_point(s_lms, PoseLandmark.LEFT_SHOULDER, s_w, s_h)
            s_r_shoulder = self._get_landmark_point(s_lms, PoseLandmark.RIGHT_SHOULDER, s_w, s_h)
            s_l_hip = self._get_landmark_point(s_lms, PoseLandmark.LEFT_HIP, s_w, s_h)
            s_r_hip = self._get_landmark_point(s_lms, PoseLandmark.RIGHT_HIP, s_w, s_h)
            
            points = [p for p in [s_l_shoulder, s_r_shoulder, s_l_hip, s_r_hip] if p]
            if points:
                s_center_x = sum(p[0] for p in points) / len(points)

        for name, y_px in levels.items():
            # SCANNING MECHANISM
            # For waist and hips, we scan a small range (+/- 5% of torso height) 
            # to find the absolute minimum (waist) and maximum (hips) width/depth
            scan_range = int(torso_height * 0.08)
            y_start = int(y_px - scan_range)
            y_end = int(y_px + scan_range)
            
            best_width_px = 0
            best_depth_cm = 0
            
            # Constraints for width extraction
            if name == 'chest':
                min_x_level = f_center_x - f_torso_width_px * 0.6
                max_x_level = f_center_x + f_torso_width_px * 0.6
            elif name == 'waist':
                min_x_level = f_center_x - f_torso_width_px * 0.55
                max_x_level = f_center_x + f_torso_width_px * 0.55
            else: # hip
                min_x_level = f_center_x - f_torso_width_px * 0.7
                max_x_level = f_center_x + f_torso_width_px * 0.7

            # Scanning loop for Front View
            widths = []
            for scan_y in range(y_start, y_end + 1):
                w = self._get_body_dimension_at_y(f_mask, scan_y, f_w, center_x=f_center_x, min_x=min_x_level, max_x=max_x_level)
                if w > 0:
                    widths.append(w)
            
            if not widths:
                # Fallback to single point if scan fails
                best_width_px = self._get_body_dimension_at_y(f_mask, y_px, f_w, center_x=f_center_x, min_x=min_x_level, max_x=max_x_level)
            elif name == 'waist':
                best_width_px = min(widths) # Narrowest part
            elif name == 'hip':
                best_width_px = max(widths) # Widest part
            else:
                best_width_px = sum(widths) / len(widths) # Average for chest/other

            width_cm = self.pixels_to_cm(best_width_px, calibration_factor) * width_correction
            
            # Side view scanning
            if side_landmarks and s_mask is not None:
                s_calibration_factor = self.calculate_calibration_factor(s_lms, s_h, calibration_height_cm, segmentation_mask=s_mask)
                if s_calibration_factor:
                    # Align Y in side view
                    s_l_shoulder = self._get_landmark_point(s_lms, PoseLandmark.LEFT_SHOULDER, s_w, s_h)
                    s_r_shoulder = self._get_landmark_point(s_lms, PoseLandmark.RIGHT_SHOULDER, s_w, s_h)
                    s_shoulder_y = (s_l_shoulder[1] + s_r_shoulder[1]) / 2 if (s_l_shoulder and s_r_shoulder) else (s_l_shoulder[1] if s_l_shoulder else s_r_shoulder[1] if s_r_shoulder else 0)
                    
                    s_l_hip = self._get_landmark_point(s_lms, PoseLandmark.LEFT_HIP, s_w, s_h)
                    s_r_hip = self._get_landmark_point(s_lms, PoseLandmark.RIGHT_HIP, s_w, s_h)
                    s_hip_y = (s_l_hip[1] + s_r_hip[1]) / 2 if (s_l_hip and s_r_hip) else (s_l_hip[1] if s_l_hip else s_r_hip[1] if s_r_hip else 0)
                    
                    s_torso_height = s_hip_y - s_shoulder_y
                    
                    # Target Y in side view
                    if name == 'chest':
                        s_target_y = s_shoulder_y + s_torso_height * chest_ratio
                    elif name == 'waist':
                        s_target_y = s_shoulder_y + s_torso_height * waist_ratio
                    else: # hip
                        s_target_y = s_shoulder_y + s_torso_height * hip_ratio
                    
                    s_scan_range = int(s_torso_height * 0.08)
                    s_y_start = int(s_target_y - s_scan_range)
                    s_y_end = int(s_target_y + s_scan_range)
                    
                    s_max_depth_px = f_torso_width_px * 0.8 * (s_calibration_factor / calibration_factor)
                    s_min_x_level = s_center_x - s_max_depth_px / 2
                    s_max_x_level = s_center_x + s_max_depth_px / 2
                    
                    depths = []
                    for s_scan_y in range(s_y_start, s_y_end + 1):
                        d = self._get_body_dimension_at_y(s_mask, s_scan_y, s_w, center_x=s_center_x, min_x=s_min_x_level, max_x=s_max_x_level)
                        if d > 0:
                            depths.append(d)
                    
                    if depths:
                        if name == 'waist':
                            best_depth_px = min(depths)
                        elif name == 'hip':
                            best_depth_px = max(depths)
                        else:
                            best_depth_px = sum(depths) / len(depths)
                        
                        best_depth_cm = self.pixels_to_cm(best_depth_px, s_calibration_factor) * depth_correction
            
            # Fallback for depth
            if best_depth_cm <= 0:
                best_depth_cm = width_cm * default_depth_ratios[name]
            
            # Calculate circumference from CV
            cv_circ = self._calculate_circumference(width_cm, best_depth_cm)
            
            # HYBRID FUSION
            # Get anthropometric estimate
            ae_measurements = self._get_anthropometric_estimate(calibration_height_cm, gender)
            ae_val = ae_measurements.get(name, cv_circ)
            
            # SELF-HEALING: If vision found almost nothing, trust AE entirely
            if cv_circ < 10: # Likely noise or invisible part
                measurements[name] = ae_val
                continue

            # Calculate dynamic weight
            # Base weight for CV - INCREASED from 0.7 to 0.85 to trust vision more
            cv_weight = 0.85 
            
            # More aggressive weight reduction based on overall confidence
            conf = front_landmarks['confidence']
            if conf < 0.5:
                cv_weight = 0.15 # Trust vision very little
            elif conf < 0.75:
                cv_weight = 0.4
            
            # Side view increase
            if side_landmarks and best_depth_cm > 1:
                cv_weight += 0.15
                
            # Clamp weight
            cv_weight = max(0.1, min(0.95, cv_weight))
            
            # Final fused value
            fused_circ = (cv_circ * cv_weight) + (ae_val * (1 - cv_weight))
            
            # AGGRESSIVE SANITY CHECK
            # If the result is wildly different (> 50%), it's likely a failure
            # In that case, we pull it hard toward AE
            if abs(fused_circ - ae_val) / ae_val > 0.50:
                # Replace with weighted bias toward statistics
                fused_circ = (fused_circ * 0.2) + (ae_val * 0.8)
            
            # Final hard bounds for all circumferences
            if fused_circ > 200 or fused_circ < 40: 
                fused_circ = ae_val
                
            measurements[name] = fused_circ
            
        # 6. Inseam (crotch to ankle)
        # Use knee landmark if visible to refine crotch position
        l_knee = self._get_landmark_point(f_lms, PoseLandmark.LEFT_KNEE, f_w, f_h)
        r_knee = self._get_landmark_point(f_lms, PoseLandmark.RIGHT_KNEE, f_w, f_h)
        
        if l_knee and r_knee:
            knee_y = (l_knee[1] + r_knee[1]) / 2
            # Crotch is usually about halfway between hip and knee
            crotch_y = hip_y + (knee_y - hip_y) * 0.45
        else:
            crotch_y = hip_y + (torso_height * 0.18)
            
        ankle_y_val = (l_ankle[1] + r_ankle[1]) / 2 if (l_ankle and r_ankle) else (l_ankle[1] if l_ankle else r_ankle[1] if r_ankle else f_h)
        inseam_px = abs(ankle_y_val - crotch_y)
        cv_inseam = self.pixels_to_cm(inseam_px, calibration_factor)
        
        # Fuse Inseam
        ae_inseam = ae_measurements.get('inseam', cv_inseam)
        # Inseam is usually accurate from CV IF confidence is high and ankles are visible
        # If ankles were cutoff, CV inseam is likely wrong
        inseam_weight = 0.85 if (l_ankle and r_ankle and not is_cutoff and front_landmarks['confidence'] > 0.8) else 0.2
        fused_inseam = (cv_inseam * inseam_weight) + (ae_inseam * (1 - inseam_weight))
        
        # Sanity check for inseam
        if abs(fused_inseam - ae_inseam) / ae_inseam > 0.35:
            fused_inseam = ae_inseam # Hard reset to statistical if wildly off
            
        measurements['inseam'] = fused_inseam
        
        # Fuse Shoulder Width (special case since it doesn't use circumference)
        ae_shoulder = ae_measurements.get('shoulder_width', measurements['shoulder_width'])
        cv_shoulder = measurements['shoulder_width']
        
        # Increased confidence weight - If we have good landmarks, trust the scan result
        shoulder_weight = 0.9 if front_landmarks['confidence'] > 0.75 else 0.4
        
        fused_shoulder = (cv_shoulder * shoulder_weight) + (ae_shoulder * (1 - shoulder_weight))
        
        # AGGRESSIVE SANITY CHECK: Shoulders shouldn't be wider than 40% of height or narrower than 15%
        # Relaxed upper bound significantly to accommodate bodybuilders/broad structures
        if fused_shoulder > calibration_height_cm * 0.40 or fused_shoulder < calibration_height_cm * 0.15:
            fused_shoulder = ae_shoulder
            
        measurements['shoulder_width'] = fused_shoulder
        
        # All measurements are now in measurements dict
        # Ensure height is included and not fused (it's the calibration base)
        measurements['height'] = calibration_height_cm
        
        # Convert to imperial if requested
        if units == "imperial":
            measurements = {
                key: round(self.cm_to_inches(value), 1)
                for key, value in measurements.items()
            }
        else:
            measurements = {
                key: round(value, 2) # More precision for metric
                for key, value in measurements.items()
            }
        
        return measurements
