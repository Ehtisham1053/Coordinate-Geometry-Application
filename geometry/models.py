import math
from typing import List, Tuple, Union, Optional
from dataclasses import dataclass

class GeometryError(Exception):
    """Base exception for all geometry errors"""
    pass

class PointError(GeometryError):
    """Exception for point-related errors"""
    pass

class LineError(GeometryError):
    """Exception for line-related errors"""
    pass

class CircleError(GeometryError):
    """Exception for circle-related errors"""
    pass

class TriangleError(GeometryError):
    """Exception for triangle-related errors"""
    pass

class PolygonError(GeometryError):
    """Exception for polygon-related errors"""
    pass

@dataclass
class Point:
    x: float
    y: float
    
    def __post_init__(self):
        try:
            self.x = float(self.x)
            self.y = float(self.y)
        except ValueError:
            raise PointError("Coordinates must be numeric values")
    
    def distance_to(self, other: 'Point') -> float:
        """Calculate distance between two points"""
        try:
            return math.sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)
        except Exception as e:
            raise PointError(f"Error calculating distance: {str(e)}")
    
    def midpoint(self, other: 'Point') -> 'Point':
        """Calculate midpoint between two points"""
        try:
            return Point((self.x + other.x) / 2, (self.y + other.y) / 2)
        except Exception as e:
            raise PointError(f"Error calculating midpoint: {str(e)}")
    
    def section_formula(self, other: 'Point', ratio: float) -> 'Point':
        """Calculate point that divides line in given ratio m:n where ratio = m/n"""
        try:
            if ratio < 0:
                raise ValueError("Ratio must be positive")
            
            # For internal division (m:n)
            x = (ratio * other.x + self.x) / (ratio + 1)
            y = (ratio * other.y + self.y) / (ratio + 1)
            return Point(x, y)
        except Exception as e:
            raise PointError(f"Error in section formula: {str(e)}")
    
    def to_dict(self) -> dict:
        """Convert point to dictionary for JSON serialization"""
        return {"x": self.x, "y": self.y}


class Line:
    def __init__(self, point1: Point, point2: Point):
        if point1.x == point2.x and point1.y == point2.y:
            raise LineError("Cannot create a line with identical points")
        self.point1 = point1
        self.point2 = point2
        
        # Calculate line equation in the form ax + by + c = 0
        self.a = self.point2.y - self.point1.y
        self.b = self.point1.x - self.point2.x
        self.c = self.point2.x * self.point1.y - self.point1.x * self.point2.y
    
    def slope(self) -> Optional[float]:
        """Calculate slope of the line"""
        try:
            if self.point2.x == self.point1.x:
                return None  # Vertical line, slope is undefined
            return (self.point2.y - self.point1.y) / (self.point2.x - self.point1.x)
        except Exception as e:
            raise LineError(f"Error calculating slope: {str(e)}")
    
    def equation(self) -> str:
        """Return the equation of the line in the form ax + by + c = 0"""
        try:
            a, b, c = self.a, self.b, self.c
            
            # Format the equation nicely
            terms = []
            if a != 0:
                terms.append(f"{a}x" if a != 1 else "x")
            if b != 0:
                sign = "+" if b > 0 and terms else ""
                terms.append(f"{sign} {b}y" if b != 1 else f"{sign} y")
            if c != 0:
                sign = "+" if c > 0 and terms else ""
                terms.append(f"{sign} {c}")
                
            return " ".join(terms) + " = 0"
        except Exception as e:
            raise LineError(f"Error generating equation: {str(e)}")
    
    def length(self) -> float:
        """Calculate length of the line segment"""
        try:
            return self.point1.distance_to(self.point2)
        except Exception as e:
            raise LineError(f"Error calculating length: {str(e)}")
    
    def is_parallel(self, other: 'Line') -> bool:
        """Check if two lines are parallel"""
        try:
            slope1 = self.slope()
            slope2 = other.slope()
            
            # If both slopes are None (vertical lines), they're parallel
            if slope1 is None and slope2 is None:
                return True
            # If only one slope is None, they're not parallel
            if slope1 is None or slope2 is None:
                return False
            # Otherwise, compare slopes
            return abs(slope1 - slope2) < 1e-10
        except Exception as e:
            raise LineError(f"Error checking parallelism: {str(e)}")
    
    def is_perpendicular(self, other: 'Line') -> bool:
        """Check if two lines are perpendicular"""
        try:
            slope1 = self.slope()
            slope2 = other.slope()
            
            # If one line is vertical and the other is horizontal
            if (slope1 is None and slope2 == 0) or (slope2 is None and slope1 == 0):
                return True
            # If both have defined slopes, check if their product is -1
            if slope1 is not None and slope2 is not None:
                return abs(slope1 * slope2 + 1) < 1e-10
            return False
        except Exception as e:
            raise LineError(f"Error checking perpendicularity: {str(e)}")
    
    def angle_with(self, other: 'Line') -> float:
        """Calculate angle between two lines in degrees"""
        try:
            slope1 = self.slope()
            slope2 = other.slope()
            
            # Handle special cases with vertical lines
            if slope1 is None and slope2 is None:
                return 0  # Parallel vertical lines
            if slope1 is None:
                return 90  # First line is vertical
            if slope2 is None:
                return 90  # Second line is vertical
            
            # Calculate angle using the formula: tan(θ) = |(m2 - m1)/(1 + m1*m2)|
            tan_theta = abs((slope2 - slope1) / (1 + slope1 * slope2))
            angle_rad = math.atan(tan_theta)
            angle_deg = math.degrees(angle_rad)
            
            return angle_deg
        except Exception as e:
            raise LineError(f"Error calculating angle: {str(e)}")
    
    def point_on_line(self, point: Point) -> bool:
        """Check if a point lies on the line"""
        try:
            # Substitute point coordinates in line equation ax + by + c = 0
            result = self.a * point.x + self.b * point.y + self.c
            return abs(result) < 1e-10
        except Exception as e:
            raise LineError(f"Error checking if point is on line: {str(e)}")
    
    def intersection_with(self, other: 'Line') -> Optional[Point]:
        """Find intersection point with another line"""
        try:
            # Check if lines are parallel
            if self.is_parallel(other):
                return None
            
            # Solve the system of equations:
            # a1x + b1y + c1 = 0
            # a2x + b2y + c2 = 0
            
            det = self.a * other.b - other.a * self.b
            if abs(det) < 1e-10:
                return None  # Lines are practically parallel
            
            x = (self.b * other.c - other.b * self.c) / det
            y = (other.a * self.c - self.a * other.c) / det
            
            return Point(x, y)
        except Exception as e:
            raise LineError(f"Error finding intersection: {str(e)}")
    
    def to_dict(self) -> dict:
        """Convert line to dictionary for JSON serialization"""
        return {
            "point1": self.point1.to_dict(),
            "point2": self.point2.to_dict(),
            "equation": self.equation(),
            "slope": self.slope(),
            "length": self.length()
        }


class Circle:
    def __init__(self, center: Point, radius: float):
        if radius <= 0:
            raise CircleError("Radius must be positive")
        self.center = center
        self.radius = float(radius)
    
    def equation(self) -> str:
        """Return the equation of the circle in the form (x-h)² + (y-k)² = r²"""
        try:
            h, k, r = self.center.x, self.center.y, self.radius
            h_term = f"(x - {h})" if h != 0 else "x"
            k_term = f"(y - {k})" if k != 0 else "y"
            return f"{h_term}² + {k_term}² = {r}²"
        except Exception as e:
            raise CircleError(f"Error generating equation: {str(e)}")
    
    def area(self) -> float:
        """Calculate area of the circle"""
        try:
            return math.pi * self.radius ** 2
        except Exception as e:
            raise CircleError(f"Error calculating area: {str(e)}")
    
    def circumference(self) -> float:
        """Calculate circumference of the circle"""
        try:
            return 2 * math.pi * self.radius
        except Exception as e:
            raise CircleError(f"Error calculating circumference: {str(e)}")
    
    def contains_point(self, point: Point) -> bool:
        """Check if a point lies inside or on the circle"""
        try:
            distance = self.center.distance_to(point)
            return distance <= self.radius
        except Exception as e:
            raise CircleError(f"Error checking if point is in circle: {str(e)}")
    
    def tangent_lines(self, point: Point) -> List[Line]:
        """Find tangent lines to the circle from an external point"""
        try:
            distance = self.center.distance_to(point)
            
            # Check if point is inside the circle
            if distance < self.radius:
                raise CircleError("Cannot draw tangent from a point inside the circle")
            
            # If point is on the circle, there's only one tangent (perpendicular to radius)
            if abs(distance - self.radius) < 1e-10:
                # Create a line perpendicular to the radius at the point
                if point.x == self.center.x:  # Vertical radius
                    # Horizontal tangent
                    second_point = Point(point.x + 1, point.y)
                else:
                    # Slope of radius
                    radius_slope = (point.y - self.center.y) / (point.x - self.center.x)
                    # Perpendicular slope
                    tangent_slope = -1 / radius_slope if radius_slope != 0 else float('inf')
                    
                    if tangent_slope == float('inf'):
                        second_point = Point(point.x, point.y + 1)
                    else:
                        second_point = Point(point.x + 1, point.y + tangent_slope)
                
                return [Line(point, second_point)]
            
            # For external point, use the formula to find tangent points
            # Distance from center to the tangent line
            d = (self.radius ** 2) / distance
            
            # Find the point on the line from center to external point that is at distance d from center
            ratio = d / distance
            p = Point(
                self.center.x + ratio * (point.x - self.center.x),
                self.center.y + ratio * (point.y - self.center.y)
            )
            
            # Find the tangent points using Pythagoras
            h = math.sqrt(self.radius ** 2 - d ** 2)
            
            # Unit vector along the line from center to external point
            dx = (point.x - self.center.x) / distance
            dy = (point.y - self.center.y) / distance
            
            # Perpendicular unit vector
            px, py = -dy, dx
            
            # Calculate the two tangent points
            t1 = Point(p.x + h * px, p.y + h * py)
            t2 = Point(p.x - h * px, p.y - h * py)
            
            return [Line(point, t1), Line(point, t2)]
        except Exception as e:
            raise CircleError(f"Error calculating tangent lines: {str(e)}")
    
    def intersection_with_line(self, line: Line) -> List[Point]:
        """Find intersection points with a line"""
        try:
            # Convert line equation ax + by + c = 0 to parametric form
            # and substitute into circle equation
            
            # Distance from center to line
            distance = abs(line.a * self.center.x + line.b * self.center.y + line.c) / math.sqrt(line.a ** 2 + line.b ** 2)
            
            # If distance > radius, no intersection
            if distance > self.radius:
                return []
            
            # If distance = radius, line is tangent with one intersection point
            if abs(distance - self.radius) < 1e-10:
                # Find the foot of perpendicular from center to line
                k = -(line.a * self.center.x + line.b * self.center.y + line.c) / (line.a ** 2 + line.b ** 2)
                x = self.center.x + k * line.a
                y = self.center.y + k * line.b
                return [Point(x, y)]
            
            # Line intersects circle at two points
            # Find foot of perpendicular
            k = -(line.a * self.center.x + line.b * self.center.y + line.c) / (line.a ** 2 + line.b ** 2)
            foot_x = self.center.x + k * line.a
            foot_y = self.center.y + k * line.b
            
            # Distance from foot to intersection points
            dist = math.sqrt(self.radius ** 2 - distance ** 2)
            
            # Unit vector along the line
            line_length = math.sqrt(line.a ** 2 + line.b ** 2)
            unit_x = -line.b / line_length
            unit_y = line.a / line_length
            
            # Calculate intersection points
            p1 = Point(foot_x + dist * unit_x, foot_y + dist * unit_y)
            p2 = Point(foot_x - dist * unit_x, foot_y - dist * unit_y)
            
            return [p1, p2]
        except Exception as e:
            raise CircleError(f"Error finding intersection with line: {str(e)}")
    
    def intersection_with_circle(self, other: 'Circle') -> List[Point]:
        """Find intersection points with another circle"""
        try:
            # Distance between centers
            d = self.center.distance_to(other.center)
            
            # Check for no intersection or one circle inside another
            if d > self.radius + other.radius or d < abs(self.radius - other.radius):
                return []
            
            # Check for tangent circles (one intersection)
            if abs(d - (self.radius + other.radius)) < 1e-10 or abs(d - abs(self.radius - other.radius)) < 1e-10:
                # Find the point of tangency
                ratio = self.radius / d
                x = self.center.x + ratio * (other.center.x - self.center.x)
                y = self.center.y + ratio * (other.center.y - self.center.y)
                return [Point(x, y)]
            
            # Two intersection points
            # Using the formula from analytical geometry
            a = (self.radius ** 2 - other.radius ** 2 + d ** 2) / (2 * d)
            h = math.sqrt(self.radius ** 2 - a ** 2)
            
            # Point on the line between centers at distance a from self.center
            x2 = self.center.x + a * (other.center.x - self.center.x) / d
            y2 = self.center.y + a * (other.center.y - self.center.y) / d
            
            # Intersection points
            x3 = x2 + h * (other.center.y - self.center.y) / d
            y3 = y2 - h * (other.center.x - self.center.x) / d
            x4 = x2 - h * (other.center.y - self.center.y) / d
            y4 = y2 + h * (other.center.x - self.center.x) / d
            
            return [Point(x3, y3), Point(x4, y4)]
        except Exception as e:
            raise CircleError(f"Error finding intersection with circle: {str(e)}")
    
    def to_dict(self) -> dict:
        """Convert circle to dictionary for JSON serialization"""
        return {
            "center": self.center.to_dict(),
            "radius": self.radius,
            "equation": self.equation(),
            "area": self.area(),
            "circumference": self.circumference()
        }


class Triangle:
    def __init__(self, p1: Point, p2: Point, p3: Point):
        # Check if points are collinear
        area = 0.5 * abs(p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y))
        if area < 1e-10:
            raise TriangleError("Points are collinear, cannot form a triangle")
        
        self.p1 = p1
        self.p2 = p2
        self.p3 = p3
        self.sides = [
            Line(p1, p2),
            Line(p2, p3),
            Line(p3, p1)
        ]
    
    def area(self) -> float:
        """Calculate area of the triangle using the cross product method"""
        try:
            return 0.5 * abs(
                self.p1.x * (self.p2.y - self.p3.y) +
                self.p2.x * (self.p3.y - self.p1.y) +
                self.p3.x * (self.p1.y - self.p2.y)
            )
        except Exception as e:
            raise TriangleError(f"Error calculating area: {str(e)}")
    
    def perimeter(self) -> float:
        """Calculate perimeter of the triangle"""
        try:
            return sum(side.length() for side in self.sides)
        except Exception as e:
            raise TriangleError(f"Error calculating perimeter: {str(e)}")
    
    def centroid(self) -> Point:
        """Calculate centroid of the triangle"""
        try:
            x = (self.p1.x + self.p2.x + self.p3.x) / 3
            y = (self.p1.y + self.p2.y + self.p3.y) / 3
            return Point(x, y)
        except Exception as e:
            raise TriangleError(f"Error calculating centroid: {str(e)}")
    
    def orthocenter(self) -> Point:
        """Calculate orthocenter of the triangle (intersection of altitudes)"""
        try:
            # Create lines for each altitude
            # For each side, create a perpendicular line through the opposite vertex
            
            # Altitude from p1 to side p2-p3
            side1 = Line(self.p2, self.p3)
            if side1.slope() is None:  # Vertical line
                alt1 = Line(self.p1, Point(self.p2.x, self.p1.y))
            elif side1.slope() == 0:  # Horizontal line
                alt1 = Line(self.p1, Point(self.p1.x, self.p2.y))
            else:
                perp_slope = -1 / side1.slope()
                # Point on altitude
                x = self.p1.x + 1
                y = self.p1.y + perp_slope
                alt1 = Line(self.p1, Point(x, y))
            
            # Altitude from p2 to side p1-p3
            side2 = Line(self.p1, self.p3)
            if side2.slope() is None:  # Vertical line
                alt2 = Line(self.p2, Point(self.p1.x, self.p2.y))
            elif side2.slope() == 0:  # Horizontal line
                alt2 = Line(self.p2, Point(self.p2.x, self.p1.y))
            else:
                perp_slope = -1 / side2.slope()
                # Point on altitude
                x = self.p2.x + 1
                y = self.p2.y + perp_slope
                alt2 = Line(self.p2, Point(x, y))
            
            # Find intersection of two altitudes
            return alt1.intersection_with(alt2)
        except Exception as e:
            raise TriangleError(f"Error calculating orthocenter: {str(e)}")
    
    def circumcenter(self) -> Point:
        """Calculate circumcenter of the triangle (center of circumscribed circle)"""
        try:
            # Create perpendicular bisectors of each side
            
            # Bisector of side p1-p2
            mid1 = self.p1.midpoint(self.p2)
            side1 = Line(self.p1, self.p2)
            if side1.slope() is None:  # Vertical line
                bis1 = Line(mid1, Point(mid1.x + 1, mid1.y))
            elif side1.slope() == 0:  # Horizontal line
                bis1 = Line(mid1, Point(mid1.x, mid1.y + 1))
            else:
                perp_slope = -1 / side1.slope()
                # Point on bisector
                x = mid1.x + 1
                y = mid1.y + perp_slope
                bis1 = Line(mid1, Point(x, y))
            
            # Bisector of side p2-p3
            mid2 = self.p2.midpoint(self.p3)
            side2 = Line(self.p2, self.p3)
            if side2.slope() is None:  # Vertical line
                bis2 = Line(mid2, Point(mid2.x + 1, mid2.y))
            elif side2.slope() == 0:  # Horizontal line
                bis2 = Line(mid2, Point(mid2.x, mid2.y + 1))
            else:
                perp_slope = -1 / side2.slope()
                # Point on bisector
                x = mid2.x + 1
                y = mid2.y + perp_slope
                bis2 = Line(mid2, Point(x, y))
            
            # Find intersection of two bisectors
            return bis1.intersection_with(bis2)
        except Exception as e:
            raise TriangleError(f"Error calculating circumcenter: {str(e)}")
    
    def incenter(self) -> Point:
        """Calculate incenter of the triangle (center of inscribed circle)"""
        try:
            # Incenter divides each angle in the ratio of the adjacent sides
            a = self.p2.distance_to(self.p3)
            b = self.p1.distance_to(self.p3)
            c = self.p1.distance_to(self.p2)
            
            x = (a * self.p1.x + b * self.p2.x + c * self.p3.x) / (a + b + c)
            y = (a * self.p1.y + b * self.p2.y + c * self.p3.y) / (a + b + c)
            
            return Point(x, y)
        except Exception as e:
            raise TriangleError(f"Error calculating incenter: {str(e)}")
    
    def circumcircle(self) -> Circle:
        """Calculate circumscribed circle of the triangle"""
        try:
            center = self.circumcenter()
            radius = center.distance_to(self.p1)
            return Circle(center, radius)
        except Exception as e:
            raise TriangleError(f"Error calculating circumcircle: {str(e)}")
    
    def incircle(self) -> Circle:
        """Calculate inscribed circle of the triangle"""
        try:
            center = self.incenter()
            
            # Calculate distance from incenter to any side
            # Using the formula: d = 2*Area/Perimeter
            area = self.area()
            perimeter = self.perimeter()
            radius = 2 * area / perimeter
            
            return Circle(center, radius)
        except Exception as e:
            raise TriangleError(f"Error calculating incircle: {str(e)}")
    
    def to_dict(self) -> dict:
        """Convert triangle to dictionary for JSON serialization"""
        return {
            "points": [self.p1.to_dict(), self.p2.to_dict(), self.p3.to_dict()],
            "area": self.area(),
            "perimeter": self.perimeter(),
            "centroid": self.centroid().to_dict(),
            "orthocenter": self.orthocenter().to_dict() if self.orthocenter() else None,
            "circumcenter": self.circumcenter().to_dict() if self.circumcenter() else None,
            "incenter": self.incenter().to_dict()
        }


class Polygon:
    def __init__(self, points: List[Point]):
        if len(points) < 3:
            raise PolygonError("A polygon must have at least 3 points")
        self.points = points
        self.sides = []
        
        # Create sides
        for i in range(len(points)):
            self.sides.append(Line(points[i], points[(i + 1) % len(points)]))
    
    def area(self) -> float:
        """Calculate area of the polygon using the Shoelace formula"""
        try:
            n = len(self.points)
            area = 0.0
            
            for i in range(n):
                j = (i + 1) % n
                area += self.points[i].x * self.points[j].y
                area -= self.points[j].x * self.points[i].y
            
            return abs(area) / 2.0
        except Exception as e:
            raise PolygonError(f"Error calculating area: {str(e)}")
    
    def perimeter(self) -> float:
        """Calculate perimeter of the polygon"""
        try:
            return sum(side.length() for side in self.sides)
        except Exception as e:
            raise PolygonError(f"Error calculating perimeter: {str(e)}")
    
    def centroid(self) -> Point:
        """Calculate centroid of the polygon"""
        try:
            n = len(self.points)
            area = self.area()
            
            cx = 0.0
            cy = 0.0
            
            for i in range(n):
                j = (i + 1) % n
                factor = self.points[i].x * self.points[j].y - self.points[j].x * self.points[i].y
                cx += (self.points[i].x + self.points[j].x) * factor
                cy += (self.points[i].y + self.points[j].y) * factor
            
            cx /= 6 * area
            cy /= 6 * area
            
            return Point(cx, cy)
        except Exception as e:
            raise PolygonError(f"Error calculating centroid: {str(e)}")
    
    def is_convex(self) -> bool:
        """Check if the polygon is convex"""
        try:
            n = len(self.points)
            if n < 3:
                return False
            
            # For a convex polygon, all cross products should have the same sign
            sign = 0
            
            for i in range(n):
                j = (i + 1) % n
                k = (i + 2) % n
                
                # Calculate cross product
                dx1 = self.points[j].x - self.points[i].x
                dy1 = self.points[j].y - self.points[i].y
                dx2 = self.points[k].x - self.points[j].x
                dy2 = self.points[k].y - self.points[j].y
                
                cross = dx1 * dy2 - dy1 * dx2
                
                if cross != 0:
                    if sign == 0:
                        sign = 1 if cross > 0 else -1
                    elif (cross > 0 and sign < 0) or (cross < 0 and sign > 0):
                        return False
            
            return True
        except Exception as e:
            raise PolygonError(f"Error checking convexity: {str(e)}")
    
    def contains_point(self, point: Point) -> bool:
        """Check if a point is inside the polygon using ray casting algorithm"""
        try:
            n = len(self.points)
            inside = False
            
            # Ray casting algorithm
            for i in range(n):
                j = (i + 1) % n
                
                # Check if point is on an edge
                edge = Line(self.points[i], self.points[j])
                if edge.point_on_line(point):
                    return True
                
                # Check if ray from point crosses edge
                if ((self.points[i].y > point.y) != (self.points[j].y > point.y)) and \
                   (point.x < (self.points[j].x - self.points[i].x) * (point.y - self.points[i].y) / 
                             (self.points[j].y - self.points[i].y) + self.points[i].x):
                    inside = not inside
            
            return inside
        except Exception as e:
            raise PolygonError(f"Error checking if point is inside polygon: {str(e)}")
    
    def to_dict(self) -> dict:
        """Convert polygon to dictionary for JSON serialization"""
        return {
            "points": [p.to_dict() for p in self.points],
            "area": self.area(),
            "perimeter": self.perimeter(),
            "centroid": self.centroid().to_dict(),
            "is_convex": self.is_convex()
        }


class Transformations:
    @staticmethod
    def translate(point: Point, dx: float, dy: float) -> Point:
        """Translate a point by (dx, dy)"""
        try:
            return Point(point.x + dx, point.y + dy)
        except Exception as e:
            raise GeometryError(f"Error in translation: {str(e)}")
    
    @staticmethod
    def translate_shape(points: List[Point], dx: float, dy: float) -> List[Point]:
        """Translate a shape (list of points) by (dx, dy)"""
        try:
            return [Transformations.translate(p, dx, dy) for p in points]
        except Exception as e:
            raise GeometryError(f"Error in shape translation: {str(e)}")
    
    @staticmethod
    def rotate(point: Point, center: Point, angle_deg: float) -> Point:
        """Rotate a point around a center by angle in degrees"""
        try:
            angle_rad = math.radians(angle_deg)
            
            # Translate point so that center becomes origin
            tx = point.x - center.x
            ty = point.y - center.y
            
            # Rotate around origin
            rx = tx * math.cos(angle_rad) - ty * math.sin(angle_rad)
            ry = tx * math.sin(angle_rad) + ty * math.cos(angle_rad)
            
            # Translate back
            return Point(rx + center.x, ry + center.y)
        except Exception as e:
            raise GeometryError(f"Error in rotation: {str(e)}")
    
    @staticmethod
    def rotate_shape(points: List[Point], center: Point, angle_deg: float) -> List[Point]:
        """Rotate a shape (list of points) around a center by angle in degrees"""
        try:
            return [Transformations.rotate(p, center, angle_deg) for p in points]
        except Exception as e:
            raise GeometryError(f"Error in shape rotation: {str(e)}")
    
    @staticmethod
    def reflect_over_x(point: Point) -> Point:
        """Reflect a point over the x-axis"""
        try:
            return Point(point.x, -point.y)
        except Exception as e:
            raise GeometryError(f"Error in reflection over x-axis: {str(e)}")
    
    @staticmethod
    def reflect_over_y(point: Point) -> Point:
        """Reflect a point over the y-axis"""
        try:
            return Point(-point.x, point.y)
        except Exception as e:
            raise GeometryError(f"Error in reflection over y-axis: {str(e)}")
    
    @staticmethod
    def reflect_over_line(point: Point, line: Line) -> Point:
        """Reflect a point over a line"""
        try:
            # If line is vertical (x = c)
            if line.b == 0:
                c = -line.c / line.a
                return Point(2 * c - point.x, point.y)
            
            # If line is horizontal (y = c)
            if line.a == 0:
                c = -line.c / line.b
                return Point(point.x, 2 * c - point.y)
            
            # General case
            # Find perpendicular line through the point
            perp_slope = -1 / line.slope()
            perp_c = point.y - perp_slope * point.x
            
            # Find intersection of perpendicular with the reflection line
            perp_a = -perp_slope
            perp_b = 1
            perp_c = -perp_c
            
            det = line.a * perp_b - perp_a * line.b
            x = (line.b * perp_c - perp_b * line.c) / det
            y = (perp_a * line.c - line.a * perp_c) / det
            
            # Reflect point through intersection
            return Point(2 * x - point.x, 2 * y - point.y)
        except Exception as e:
            raise GeometryError(f"Error in reflection over line: {str(e)}")
    
    @staticmethod
    def reflect_shape(points: List[Point], line: Line) -> List[Point]:
        """Reflect a shape (list of points) over a line"""
        try:
            return [Transformations.reflect_over_line(p, line) for p in points]
        except Exception as e:
            raise GeometryError(f"Error in shape reflection: {str(e)}")
    
    @staticmethod
    def scale(point: Point, center: Point, sx: float, sy: float) -> Point:
        """Scale a point from a center by factors sx and sy"""
        try:
            # Translate point so that center becomes origin
            tx = point.x - center.x
            ty = point.y - center.y
            
            # Scale
            rx = tx * sx
            ry = ty * sy
            
            # Translate back
            return Point(rx + center.x, ry + center.y)
        except Exception as e:
            raise GeometryError(f"Error in scaling: {str(e)}")
    
    @staticmethod
    def scale_shape(points: List[Point], center: Point, sx: float, sy: float) -> List[Point]:
        """Scale a shape (list of points) from a center by factors sx and sy"""
        try:
            return [Transformations.scale(p, center, sx, sy) for p in points]
        except Exception as e:
            raise GeometryError(f"Error in shape scaling: {str(e)}")


class GeometryEngine:
    """Main class to handle all geometry operations"""
    
    @staticmethod
    def are_collinear(p1: Point, p2: Point, p3: Point) -> bool:
        """Check if three points are collinear"""
        try:
            # Calculate area of triangle formed by the three points
            # If area is zero, points are collinear
            area = 0.5 * abs(
                p1.x * (p2.y - p3.y) +
                p2.x * (p3.y - p1.y) +
                p3.x * (p1.y - p2.y)
            )
            return abs(area) < 1e-10
        except Exception as e:
            raise GeometryError(f"Error checking collinearity: {str(e)}")
    
    @staticmethod
    def distance_point_to_line(point: Point, line: Line) -> float:
        """Calculate distance from a point to a line"""
        try:
            return abs(line.a * point.x + line.b * point.y + line.c) / math.sqrt(line.a ** 2 + line.b ** 2)
        except Exception as e:
            raise GeometryError(f"Error calculating distance from point to line: {str(e)}")
    
    @staticmethod
    def angle_between_lines(line1: Line, line2: Line) -> float:
        """Calculate angle between two lines in degrees"""
        return line1.angle_with(line2)
    
    @staticmethod
    def is_point_inside_polygon(point: Point, polygon: Polygon) -> bool:
        """Check if a point is inside a polygon"""
        return polygon.contains_point(point)
    
    @staticmethod
    def convex_hull(points: List[Point]) -> List[Point]:
        """Calculate the convex hull of a set of points using Graham scan algorithm"""
        try:
            if len(points) <= 2:
                return points
            
            # Find the point with the lowest y-coordinate (and leftmost if tied)
            pivot = min(points, key=lambda p: (p.y, p.x))
            
            # Sort points by polar angle with respect to pivot
            def polar_angle(p):
                if p.x == pivot.x and p.y == pivot.y:
                    return -float('inf')  # Pivot comes first
                return math.atan2(p.y - pivot.y, p.x - pivot.x)
            
            sorted_points = sorted(points, key=polar_angle)
            
            # Graham scan algorithm
            hull = [sorted_points[0], sorted_points[1]]
            
            for i in range(2, len(sorted_points)):
                while len(hull) > 1:
                    # Check if the last three points make a right turn
                    p1, p2, p3 = hull[-2], hull[-1], sorted_points[i]
                    
                    # Cross product to determine turn direction
                    cross = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x)
                    
                    # If right turn or collinear, remove the middle point
                    if cross <= 0:
                        hull.pop()
                    else:
                        break
                
                hull.append(sorted_points[i])
            
            return hull
        except Exception as e:
            raise GeometryError(f"Error calculating convex hull: {str(e)}")
    
    @staticmethod
    def create_point(x: float, y: float) -> Point:
        """Create a point with given coordinates"""
        return Point(x, y)
    
    @staticmethod
    def create_line(p1: Point, p2: Point) -> Line:
        """Create a line passing through two points"""
        return Line(p1, p2)
    
    @staticmethod
    def create_circle(center: Point, radius: float) -> Circle:
        """Create a circle with given center and radius"""
        return Circle(center, radius)
    
    @staticmethod
    def create_triangle(p1: Point, p2: Point, p3: Point) -> Triangle:
        """Create a triangle with given vertices"""
        return Triangle(p1, p2, p3)
    
    @staticmethod
    def create_polygon(points: List[Point]) -> Polygon:
        """Create a polygon with given vertices"""
        return Polygon(points)

print("Geometry models loaded successfully!")