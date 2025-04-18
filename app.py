from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import json
import traceback
import os
from geometry.models import (
    Point, Line, Circle, Triangle, Polygon, Transformations, GeometryEngine,
    GeometryError, PointError, LineError, CircleError, TriangleError, PolygonError
)

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Enable CORS for all routes

# Ensure the static directory exists
os.makedirs('static', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/report')
def report():
    return render_template('report.html')

@app.route('/static/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

# Helper function to parse points from request
def parse_points(data):
    points = []
    for point_data in data:
        try:
            x = float(point_data.get('x', 0))
            y = float(point_data.get('y', 0))
            points.append(Point(x, y))
        except ValueError:
            raise PointError("Invalid point coordinates")
    return points

# API Routes
@app.route('/api/point/distance', methods=['POST'])
def point_distance():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        distance = p1.distance_to(p2)
        return jsonify({
            'success': True,
            'result': {
                'distance': distance,
                'point1': p1.to_dict(),
                'point2': p2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/point/midpoint', methods=['POST'])
def point_midpoint():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        midpoint = p1.midpoint(p2)
        return jsonify({
            'success': True,
            'result': {
                'midpoint': midpoint.to_dict(),
                'point1': p1.to_dict(),
                'point2': p2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/point/section', methods=['POST'])
def point_section():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        ratio = float(data['ratio'])
        section_point = p1.section_formula(p2, ratio)
        return jsonify({
            'success': True,
            'result': {
                'section_point': section_point.to_dict(),
                'point1': p1.to_dict(),
                'point2': p2.to_dict(),
                'ratio': ratio
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/create', methods=['POST'])
def line_create():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        line = Line(p1, p2)
        return jsonify({
            'success': True,
            'result': line.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/slope', methods=['POST'])
def line_slope():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        line = Line(p1, p2)
        slope = line.slope()
        return jsonify({
            'success': True,
            'result': {
                'slope': slope,
                'line': line.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/equation', methods=['POST'])
def line_equation():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        line = Line(p1, p2)
        equation = line.equation()
        return jsonify({
            'success': True,
            'result': {
                'equation': equation,
                'line': line.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/parallel', methods=['POST'])
def line_parallel():
    try:
        data = request.json
        p1 = Point(data['line1']['point1']['x'], data['line1']['point1']['y'])
        p2 = Point(data['line1']['point2']['x'], data['line1']['point2']['y'])
        p3 = Point(data['line2']['point1']['x'], data['line2']['point1']['y'])
        p4 = Point(data['line2']['point2']['x'], data['line2']['point2']['y'])
        
        line1 = Line(p1, p2)
        line2 = Line(p3, p4)
        
        is_parallel = line1.is_parallel(line2)
        
        return jsonify({
            'success': True,
            'result': {
                'is_parallel': is_parallel,
                'line1': line1.to_dict(),
                'line2': line2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/perpendicular', methods=['POST'])
def line_perpendicular():
    try:
        data = request.json
        p1 = Point(data['line1']['point1']['x'], data['line1']['point1']['y'])
        p2 = Point(data['line1']['point2']['x'], data['line1']['point2']['y'])
        p3 = Point(data['line2']['point1']['x'], data['line2']['point1']['y'])
        p4 = Point(data['line2']['point2']['x'], data['line2']['point2']['y'])
        
        line1 = Line(p1, p2)
        line2 = Line(p3, p4)
        
        is_perpendicular = line1.is_perpendicular(line2)
        
        return jsonify({
            'success': True,
            'result': {
                'is_perpendicular': is_perpendicular,
                'line1': line1.to_dict(),
                'line2': line2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/angle', methods=['POST'])
def line_angle():
    try:
        data = request.json
        p1 = Point(data['line1']['point1']['x'], data['line1']['point1']['y'])
        p2 = Point(data['line1']['point2']['x'], data['line1']['point2']['y'])
        p3 = Point(data['line2']['point1']['x'], data['line2']['point1']['y'])
        p4 = Point(data['line2']['point2']['x'], data['line2']['point2']['y'])
        
        line1 = Line(p1, p2)
        line2 = Line(p3, p4)
        
        angle = line1.angle_with(line2)
        
        return jsonify({
            'success': True,
            'result': {
                'angle': angle,
                'line1': line1.to_dict(),
                'line2': line2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/line/intersection', methods=['POST'])
def line_intersection():
    try:
        data = request.json
        p1 = Point(data['line1']['point1']['x'], data['line1']['point1']['y'])
        p2 = Point(data['line1']['point2']['x'], data['line1']['point2']['y'])
        p3 = Point(data['line2']['point1']['x'], data['line2']['point1']['y'])
        p4 = Point(data['line2']['point2']['x'], data['line2']['point2']['y'])
        
        line1 = Line(p1, p2)
        line2 = Line(p3, p4)
        
        intersection = line1.intersection_with(line2)
        
        return jsonify({
            'success': True,
            'result': {
                'intersection': intersection.to_dict() if intersection else None,
                'line1': line1.to_dict(),
                'line2': line2.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/circle/create', methods=['POST'])
def circle_create():
    try:
        data = request.json
        center = Point(data['center']['x'], data['center']['y'])
        radius = float(data['radius'])
        
        circle = Circle(center, radius)
        
        return jsonify({
            'success': True,
            'result': circle.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/circle/area', methods=['POST'])
def circle_area():
    try:
        data = request.json
        center = Point(data['center']['x'], data['center']['y'])
        radius = float(data['radius'])
        
        circle = Circle(center, radius)
        area = circle.area()
        
        return jsonify({
            'success': True,
            'result': {
                'area': area,
                'circle': circle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/circle/circumference', methods=['POST'])
def circle_circumference():
    try:
        data = request.json
        center = Point(data['center']['x'], data['center']['y'])
        radius = float(data['radius'])
        
        circle = Circle(center, radius)
        circumference = circle.circumference()
        
        return jsonify({
            'success': True,
            'result': {
                'circumference': circumference,
                'circle': circle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/circle/contains', methods=['POST'])
def circle_contains():
    try:
        data = request.json
        center = Point(data['circle']['center']['x'], data['circle']['center']['y'])
        radius = float(data['circle']['radius'])
        point = Point(data['point']['x'], data['point']['y'])
        
        circle = Circle(center, radius)
        contains = circle.contains_point(point)
        
        return jsonify({
            'success': True,
            'result': {
                'contains': contains,
                'circle': circle.to_dict(),
                'point': point.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/circle/line_intersection', methods=['POST'])
def circle_line_intersection():
    try:
        data = request.json
        center = Point(data['circle']['center']['x'], data['circle']['center']['y'])
        radius = float(data['circle']['radius'])
        p1 = Point(data['line']['point1']['x'], data['line']['point1']['y'])
        p2 = Point(data['line']['point2']['x'], data['line']['point2']['y'])
        
        circle = Circle(center, radius)
        line = Line(p1, p2)
        
        intersections = circle.intersection_with_line(line)
        
        return jsonify({
            'success': True,
            'result': {
                'intersections': [p.to_dict() for p in intersections],
                'circle': circle.to_dict(),
                'line': line.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/triangle/create', methods=['POST'])
def triangle_create():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        triangle = Triangle(p1, p2, p3)
        
        return jsonify({
            'success': True,
            'result': triangle.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/triangle/area', methods=['POST'])
def triangle_area():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        triangle = Triangle(p1, p2, p3)
        area = triangle.area()
        
        return jsonify({
            'success': True,
            'result': {
                'area': area,
                'triangle': triangle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/triangle/centroid', methods=['POST'])
def triangle_centroid():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        triangle = Triangle(p1, p2, p3)
        centroid = triangle.centroid()
        
        return jsonify({
            'success': True,
            'result': {
                'centroid': centroid.to_dict(),
                'triangle': triangle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/triangle/orthocenter', methods=['POST'])
def triangle_orthocenter():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        triangle = Triangle(p1, p2, p3)
        orthocenter = triangle.orthocenter()
        
        return jsonify({
            'success': True,
            'result': {
                'orthocenter': orthocenter.to_dict() if orthocenter else None,
                'triangle': triangle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/triangle/circumcenter', methods=['POST'])
def triangle_circumcenter():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        triangle = Triangle(p1, p2, p3)
        circumcenter = triangle.circumcenter()
        
        return jsonify({
            'success': True,
            'result': {
                'circumcenter': circumcenter.to_dict() if circumcenter else None,
                'triangle': triangle.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/polygon/create', methods=['POST'])
def polygon_create():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        polygon = Polygon(points)
        
        return jsonify({
            'success': True,
            'result': polygon.to_dict()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/polygon/area', methods=['POST'])
def polygon_area():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        polygon = Polygon(points)
        area = polygon.area()
        
        return jsonify({
            'success': True,
            'result': {
                'area': area,
                'polygon': polygon.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400


@app.route('/api/polygon/perimeter', methods=['POST'])
def polygon_perimeter():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        polygon = Polygon(points)
        perimeter = polygon.perimeter()
        
        return jsonify({
            'success': True,
            'result': {
                'perimeter': perimeter,
                'polygon': polygon.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/polygon/centroid', methods=['POST'])
def polygon_centroid():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        polygon = Polygon(points)
        centroid = polygon.centroid()
        
        return jsonify({
            'success': True,
            'result': {
                'centroid': centroid.to_dict(),
                'polygon': polygon.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/polygon/is_convex', methods=['POST'])
def polygon_is_convex():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        polygon = Polygon(points)
        is_convex = polygon.is_convex()
        
        return jsonify({
            'success': True,
            'result': {
                'is_convex': is_convex,
                'polygon': polygon.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/transform/translate', methods=['POST'])
def transform_translate():
    try:
        data = request.json
        points_data = data['points']
        dx = float(data['dx'])
        dy = float(data['dy'])
        
        points = parse_points(points_data)
        transformed_points = Transformations.translate_shape(points, dx, dy)
        
        return jsonify({
            'success': True,
            'result': {
                'original_points': [p.to_dict() for p in points],
                'transformed_points': [p.to_dict() for p in transformed_points],
                'dx': dx,
                'dy': dy
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/transform/rotate', methods=['POST'])
def transform_rotate():
    try:
        data = request.json
        points_data = data['points']
        center_data = data['center']
        angle = float(data['angle'])
        
        points = parse_points(points_data)
        center = Point(center_data['x'], center_data['y'])
        
        transformed_points = Transformations.rotate_shape(points, center, angle)
        
        return jsonify({
            'success': True,
            'result': {
                'original_points': [p.to_dict() for p in points],
                'transformed_points': [p.to_dict() for p in transformed_points],
                'center': center.to_dict(),
                'angle': angle
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/transform/reflect', methods=['POST'])
def transform_reflect():
    try:
        data = request.json
        points_data = data['points']
        line_data = data['line']
        
        points = parse_points(points_data)
        p1 = Point(line_data['point1']['x'], line_data['point1']['y'])
        p2 = Point(line_data['point2']['x'], line_data['point2']['y'])
        line = Line(p1, p2)
        
        transformed_points = Transformations.reflect_shape(points, line)
        
        return jsonify({
            'success': True,
            'result': {
                'original_points': [p.to_dict() for p in points],
                'transformed_points': [p.to_dict() for p in transformed_points],
                'line': line.to_dict()
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/transform/scale', methods=['POST'])
def transform_scale():
    try:
        data = request.json
        points_data = data['points']
        center_data = data['center']
        sx = float(data['sx'])
        sy = float(data['sy'])
        
        points = parse_points(points_data)
        center = Point(center_data['x'], center_data['y'])
        
        transformed_points = Transformations.scale_shape(points, center, sx, sy)
        
        return jsonify({
            'success': True,
            'result': {
                'original_points': [p.to_dict() for p in points],
                'transformed_points': [p.to_dict() for p in transformed_points],
                'center': center.to_dict(),
                'sx': sx,
                'sy': sy
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/engine/collinear', methods=['POST'])
def engine_collinear():
    try:
        data = request.json
        p1 = Point(data['point1']['x'], data['point1']['y'])
        p2 = Point(data['point2']['x'], data['point2']['y'])
        p3 = Point(data['point3']['x'], data['point3']['y'])
        
        is_collinear = GeometryEngine.are_collinear(p1, p2, p3)
        
        return jsonify({
            'success': True,
            'result': {
                'is_collinear': is_collinear,
                'points': [p1.to_dict(), p2.to_dict(), p3.to_dict()]
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

@app.route('/api/engine/convex_hull', methods=['POST'])
def engine_convex_hull():
    try:
        data = request.json
        points_data = data['points']
        points = parse_points(points_data)
        
        hull_points = GeometryEngine.convex_hull(points)
        
        return jsonify({
            'success': True,
            'result': {
                'original_points': [p.to_dict() for p in points],
                'hull_points': [p.to_dict() for p in hull_points]
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)