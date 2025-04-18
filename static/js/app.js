// Global variables
let graph = null;
let currentPoints = [];
let polygonPoints = [];
let currentOperation = null;
let currentShape = null;

// DOM elements
const shapeSelect = document.getElementById('shapeSelect');
const operationSelect = document.getElementById('operationSelect');
const dynamicForm = document.getElementById('dynamicForm');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const resultText = document.getElementById('resultText');
const graphContainer = document.getElementById('graphContainer');
const downloadGraphBtn = document.getElementById('downloadGraphBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const learnModeToggle = document.getElementById('learnModeToggle');
const formulaExplanation = document.getElementById('formulaExplanation');
const formulaContent = document.getElementById('formulaContent');
const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
const errorModalBody = document.getElementById('errorModalBody');

// Operation definitions
const operations = {
    point: {
        distance: { 
            name: 'Distance between Points',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' }
            ],
            endpoint: '/api/point/distance',
            formula: 'Distance = √[(x₂ - x₁)² + (y₂ - y₁)²]',
            explanation: 'The distance between two points (x₁, y₁) and (x₂, y₂) is calculated using the Pythagorean theorem. We find the horizontal distance (x₂ - x₁) and vertical distance (y₂ - y₁), square them, add them together, and take the square root.'
        },
        midpoint: { 
            name: 'Midpoint',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' }
            ],
            endpoint: '/api/point/midpoint',
            formula: 'Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2)',
            explanation: 'The midpoint between two points (x₁, y₁) and (x₂, y₂) is calculated by taking the average of the x-coordinates and the average of the y-coordinates.'
        },
        section: { 
            name: 'Section Formula',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' },
                { type: 'number', id: 'ratio', label: 'Ratio (m:n as m/n)', min: 0, step: 'any' }
            ],
            endpoint: '/api/point/section',
            formula: 'Point = ((m·x₂ + n·x₁)/(m + n), (m·y₂ + n·y₁)/(m + n))',
            explanation: 'The section formula divides a line segment in a given ratio m:n. If the ratio is m/n, then the point is located at a distance of m/(m+n) of the total length from the first point.'
        }
    },
    line: {
        create: { 
            name: 'Create Line',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' }
            ],
            endpoint: '/api/line/create',
            formula: 'Line Equation: ax + by + c = 0',
            explanation: 'A line is defined by two points. The equation of a line can be written in the form ax + by + c = 0, where a, b, and c are constants. Given two points (x₁, y₁) and (x₂, y₂), we can find these constants.'
        },
        slope: { 
            name: 'Calculate Slope',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' }
            ],
            endpoint: '/api/line/slope',
            formula: 'Slope = (y₂ - y₁)/(x₂ - x₁)',
            explanation: 'The slope of a line is a measure of its steepness. It is calculated as the ratio of the vertical change (rise) to the horizontal change (run) between two points on the line. For points (x₁, y₁) and (x₂, y₂), the slope is (y₂ - y₁)/(x₂ - x₁).'
        },
        equation: { 
            name: 'Line Equation',
            fields: [
                { type: 'point', id: 'point1', label: 'Point 1' },
                { type: 'point', id: 'point2', label: 'Point 2' }
            ],
            endpoint: '/api/line/equation',
            formula: 'Line Equation: ax + by + c = 0',
            explanation: 'The equation of a line can be derived from two points. If the points are (x₁, y₁) and (x₂, y₂), we can find the coefficients a, b, and c for the standard form ax + by + c = 0.'
        },
        parallel: { 
            name: 'Check if Lines are Parallel',
            fields: [
                { type: 'point', id: 'line1_point1', label: 'Line 1 - Point 1' },
                { type: 'point', id: 'line1_point2', label: 'Line 1 - Point 2' },
                { type: 'point', id: 'line2_point1', label: 'Line 2 - Point 1' },
                { type: 'point', id: 'line2_point2', label: 'Line 2 - Point 2' }
            ],
            endpoint: '/api/line/parallel',
            formula: 'Lines are parallel if their slopes are equal: m₁ = m₂',
            explanation: 'Two lines are parallel if they have the same slope but different y-intercepts. For two lines with slopes m₁ and m₂, they are parallel if m₁ = m₂.'
        },
        perpendicular: { 
            name: 'Check if Lines are Perpendicular',
            fields: [
                { type: 'point', id: 'line1_point1', label: 'Line 1 - Point 1' },
                { type: 'point', id: 'line1_point2', label: 'Line 1 - Point 2' },
                { type: 'point', id: 'line2_point1', label: 'Line 2 - Point 1' },
                { type: 'point', id: 'line2_point2', label: 'Line 2 - Point 2' }
            ],
            endpoint: '/api/line/perpendicular',
            formula: 'Lines are perpendicular if their slopes multiply to -1: m₁ · m₂ = -1',
            explanation: 'Two lines are perpendicular if their slopes are negative reciprocals of each other. For two lines with slopes m₁ and m₂, they are perpendicular if m₁ · m₂ = -1.'
        },
        angle: { 
            name: 'Angle Between Lines',
            fields: [
                { type: 'point', id: 'line1_point1', label: 'Line 1 - Point 1' },
                { type: 'point', id: 'line1_point2', label: 'Line 1 - Point 2' },
                { type: 'point', id: 'line2_point1', label: 'Line 2 - Point 1' },
                { type: 'point', id: 'line2_point2', label: 'Line 2 - Point 2' }
            ],
            endpoint: '/api/line/angle',
            formula: 'tan(θ) = |(m₂ - m₁)/(1 + m₁·m₂)|',
            explanation: 'The angle between two lines can be calculated using their slopes. If the slopes are m₁ and m₂, then tan(θ) = |(m₂ - m₁)/(1 + m₁·m₂)|, where θ is the angle between the lines.'
        },
        intersection: { 
            name: 'Line Intersection',
            fields: [
                { type: 'point', id: 'line1_point1', label: 'Line 1 - Point 1' },
                { type: 'point', id: 'line1_point2', label: 'Line 1 - Point 2' },
                { type: 'point', id: 'line2_point1', label: 'Line 2 - Point 1' },
                { type: 'point', id: 'line2_point2', label: 'Line 2 - Point 2' }
            ],
            endpoint: '/api/line/intersection',
            formula: 'Solve the system: a₁x + b₁y + c₁ = 0, a₂x + b₂y + c₂ = 0',
            explanation: 'To find the intersection of two lines, we solve their equations simultaneously. If the lines are given by a₁x + b₁y + c₁ = 0 and a₂x + b₂y + c₂ = 0, we can solve for x and y to find the intersection point.'
        }
    },
    circle: {
        create: { 
            name: 'Create Circle',
            fields: [
                { type: 'point', id: 'center', label: 'Center' },
                { type: 'number', id: 'radius', label: 'Radius', min: 0, step: 'any' }
            ],
            endpoint: '/api/circle/create',
            formula: 'Circle Equation: (x - h)² + (y - k)² = r²',
            explanation: 'A circle is defined by its center (h, k) and radius r. The equation of a circle is (x - h)² + (y - k)² = r², which represents all points that are at a distance r from the center.'
        },
        area: { 
            name: 'Circle Area',
            fields: [
                { type: 'point', id: 'center', label: 'Center' },
                { type: 'number', id: 'radius', label: 'Radius', min: 0, step: 'any' }
            ],
            endpoint: '/api/circle/area',
            formula: 'Area = πr²',
            explanation: 'The area of a circle is calculated using the formula πr², where r is the radius of the circle and π is approximately 3.14159.'
        },
        circumference: { 
            name: 'Circle Circumference',
            fields: [
                { type: 'point', id: 'center', label: 'Center' },
                { type: 'number', id: 'radius', label: 'Radius', min: 0, step: 'any' }
            ],
            endpoint: '/api/circle/circumference',
            formula: 'Circumference = 2πr',
            explanation: 'The circumference (perimeter) of a circle is calculated using the formula 2πr, where r is the radius of the circle and π is approximately 3.14159.'
        },
        contains: { 
            name: 'Check if Point is Inside Circle',
            fields: [
                { type: 'point', id: 'center', label: 'Circle Center' },
                { type: 'number', id: 'radius', label: 'Circle Radius', min: 0, step: 'any' },
                { type: 'point', id: 'test_point', label: 'Test Point' }
            ],
            endpoint: '/api/circle/contains',
            formula: 'Point is inside if: distance(center, point) ≤ radius',
            explanation: 'A point is inside a circle if the distance from the point to the center of the circle is less than or equal to the radius of the circle. This is calculated using the distance formula between two points.'
        },
        line_intersection: { 
            name: 'Circle-Line Intersection',
            fields: [
                { type: 'point', id: 'center', label: 'Circle Center' },
                { type: 'number', id: 'radius', label: 'Circle Radius', min: 0, step: 'any' },
                { type: 'point', id: 'line_point1', label: 'Line Point 1' },
                { type: 'point', id: 'line_point2', label: 'Line Point 2' }
            ],
            endpoint: '/api/circle/line_intersection',
            formula: 'Substitute line equation into circle equation',
            explanation: 'To find the intersection points of a circle and a line, we substitute the line equation into the circle equation and solve the resulting quadratic equation. This gives us 0, 1, or 2 intersection points depending on whether the line misses, touches, or crosses the circle.'
        }
    },
    triangle: {
        create: { 
            name: 'Create Triangle',
            fields: [
                { type: 'point', id: 'point1', label: 'Vertex 1' },
                { type: 'point', id: 'point2', label: 'Vertex 2' },
                { type: 'point', id: 'point3', label: 'Vertex 3' }
            ],
            endpoint: '/api/triangle/create',
            formula: 'Triangle defined by three vertices',
            explanation: 'A triangle is defined by its three vertices. The vertices must not be collinear (lie on the same line) for a valid triangle.'
        },
        area: { 
            name: 'Triangle Area',
            fields: [
                { type: 'point', id: 'point1', label: 'Vertex 1' },
                { type: 'point', id: 'point2', label: 'Vertex 2' },
                { type: 'point', id: 'point3', label: 'Vertex 3' }
            ],
            endpoint: '/api/triangle/area',
            formula: 'Area = (1/2)|x₁(y₂ - y₃) + x₂(y₃ - y₁) + x₃(y₁ - y₂)|',
            explanation: 'The area of a triangle can be calculated using the coordinates of its vertices. This formula is derived from the cross product method and is equivalent to finding half the magnitude of the cross product of two sides of the triangle.'
        },
        centroid: { 
            name: 'Triangle Centroid',
            fields: [
                { type: 'point', id: 'point1', label: 'Vertex 1' },
                { type: 'point', id: 'point2', label: 'Vertex 2' },
                { type: 'point', id: 'point3', label: 'Vertex 3' }
            ],
            endpoint: '/api/triangle/centroid',
            formula: 'Centroid = ((x₁ + x₂ + x₃)/3, (y₁ + y₂ + y₃)/3)',
            explanation: 'The centroid of a triangle is the point where the three medians of the triangle intersect. A median is a line from a vertex to the midpoint of the opposite side. The centroid divides each median in a 2:1 ratio, with the longer part toward the vertex.'
        },
        orthocenter: { 
            name: 'Triangle Orthocenter',
            fields: [
                { type: 'point', id: 'point1', label: 'Vertex 1' },
                { type: 'point', id: 'point2', label: 'Vertex 2' },
                { type: 'point', id: 'point3', label: 'Vertex 3' }
            ],
            endpoint: '/api/triangle/orthocenter',
            formula: 'Intersection of the three altitudes',
            explanation: 'The orthocenter of a triangle is the point where the three altitudes of the triangle intersect. An altitude is a line from a vertex perpendicular to the opposite side (or its extension).'
        },
        circumcenter: { 
            name: 'Triangle Circumcenter',
            fields: [
                { type: 'point', id: 'point1', label: 'Vertex 1' },
                { type: 'point', id: 'point2', label: 'Vertex 2' },
                { type: 'point', id: 'point3', label: 'Vertex 3' }
            ],
            endpoint: '/api/triangle/circumcenter',
            formula: 'Intersection of the perpendicular bisectors of the sides',
            explanation: 'The circumcenter of a triangle is the center of the circle that passes through all three vertices of the triangle (the circumscribed circle). It is located at the intersection of the perpendicular bisectors of the three sides of the triangle.'
        }
    },
    polygon: {
        create: { 
            name: 'Create Polygon',
            fields: [
                { type: 'polygon', id: 'polygon_points', label: 'Polygon Points' }
            ],
            endpoint: '/api/polygon/create',
            formula: 'Polygon defined by vertices (x₁, y₁), (x₂, y₂), ..., (xₙ, yₙ)',
            explanation: 'A polygon is defined by a sequence of vertices. Each vertex is connected to the next vertex in the sequence, and the last vertex is connected to the first, forming a closed shape.'
        },
        area: { 
            name: 'Polygon Area',
            fields: [
                { type: 'polygon', id: 'polygon_points', label: 'Polygon Points' }
            ],
            endpoint: '/api/polygon/area',
            formula: 'Area = (1/2)|∑ᵢ₌₁ⁿ xᵢ(yᵢ₊₁ - yᵢ₋₁)|',
            explanation: 'The area of a polygon can be calculated using the Shoelace formula (also known as the surveyor\'s formula). It works by taking the sum of the cross products of adjacent vertices.'
        },
        perimeter: { 
            name: 'Polygon Perimeter',
            fields: [
                { type: 'polygon', id: 'polygon_points', label: 'Polygon Points' }
            ],
            endpoint: '/api/polygon/perimeter',
            formula: 'Perimeter = ∑ᵢ₌₁ⁿ distance((xᵢ, yᵢ), (xᵢ₊₁, yᵢ₊₁))',
            explanation: 'The perimeter of a polygon is the sum of the lengths of all its sides. Each side length is calculated as the distance between consecutive vertices.'
        },
        centroid: { 
            name: 'Polygon Centroid',
            fields: [
                { type: 'polygon', id: 'polygon_points', label: 'Polygon Points' }
            ],
            endpoint: '/api/polygon/centroid',
            formula: 'Complex formula based on weighted average of vertices',
            explanation: 'The centroid of a polygon is the arithmetic mean position of all the points in the shape. For simple polygons, it can be calculated as a weighted average of the centroids of a set of triangles.'
        },
        is_convex: { 
            name: 'Check if Polygon is Convex',
            fields: [
                { type: 'polygon', id: 'polygon_points', label: 'Polygon Points' }
            ],
            endpoint: '/api/polygon/is_convex',
            formula: 'Check if all interior angles are less than 180°',
            explanation: 'A polygon is convex if all its interior angles are less than 180 degrees. Equivalently, a polygon is convex if all vertices point outwards. This can be checked by ensuring that all cross products of consecutive edges have the same sign.'
        }
    },
    transform: {
        translate: { 
            name: 'Translation',
            fields: [
                { type: 'polygon', id: 'points', label: 'Points to Translate' },
                { type: 'number', id: 'dx', label: 'X Translation', step: 'any' },
                { type: 'number', id: 'dy', label: 'Y Translation', step: 'any' }
            ],
            endpoint: '/api/transform/translate',
            formula: 'New Point = (x + dx, y + dy)',
            explanation: 'Translation moves every point of a shape by the same amount in a given direction. If a point has coordinates (x, y) and we translate by (dx, dy), the new coordinates will be (x + dx, y + dy).'
        },
        rotate: { 
            name: 'Rotation',
            fields: [
                { type: 'polygon', id: 'points', label: 'Points to Rotate' },
                { type: 'point', id: 'center', label: 'Center of Rotation' },
                { type: 'number', id: 'angle', label: 'Angle (degrees)', step: 'any' }
            ],
            endpoint: '/api/transform/rotate',
            formula: 'Complex formula involving trigonometric functions',
            explanation: 'Rotation turns points around a fixed center point by a specified angle. The formula involves translating to make the center the origin, applying a rotation matrix, and then translating back.'
        },
        reflect: { 
            name: 'Reflection',
            fields: [
                { type: 'polygon', id: 'points', label: 'Points to Reflect' },
                { type: 'point', id: 'line_point1', label: 'Line Point 1' },
                { type: 'point', id: 'line_point2', label: 'Line Point 2' }
            ],
            endpoint: '/api/transform/reflect',
            formula: 'Complex formula based on perpendicular distance to line',
            explanation: 'Reflection creates a mirror image of a shape across a line. Each point is reflected to a position where the reflection line is the perpendicular bisector of the line connecting the original point and its reflection.'
        },
        scale: { 
            name: 'Scaling',
            fields: [
                { type: 'polygon', id: 'points', label: 'Points to Scale' },
                { type: 'point', id: 'center', label: 'Center of Scaling' },
                { type: 'number', id: 'sx', label: 'X Scale Factor', step: 'any' },
                { type: 'number', id: 'sy', label: 'Y Scale Factor', step: 'any' }
            ],
            endpoint: '/api/transform/scale',
            formula: 'New Point = (center.x + sx(x - center.x), center.y + sy(y - center.y))',
            explanation: 'Scaling changes the size of a shape relative to a center point. If we scale by factors sx and sy from a center point (cx, cy), a point (x, y) becomes (cx + sx(x - cx), cy + sy(y - cy)).'
        }
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Plotly graph
    initGraph();
    
    // Set up event listeners
    shapeSelect.addEventListener('change', updateOperations);
    operationSelect.addEventListener('change', updateForm);
    calculateBtn.addEventListener('click', performCalculation);
    clearBtn.addEventListener('click', clearAll);
    downloadGraphBtn.addEventListener('click', downloadGraph);
    exportPdfBtn.addEventListener('click', exportToPdf);
    learnModeToggle.addEventListener('change', toggleLearnMode);
    
    // Initial setup
    updateOperations();
});

// Initialize the graph
function initGraph() {
    const layout = {
        title: 'Coordinate Geometry Visualization',
        xaxis: {
            title: 'X',
            zeroline: true,
            gridcolor: '#e6e6e6',
            zerolinecolor: '#000000',
            zerolinewidth: 2
        },
        yaxis: {
            title: 'Y',
            zeroline: true,
            gridcolor: '#e6e6e6',
            zerolinecolor: '#000000',
            zerolinewidth: 2,
            scaleanchor: 'x',
            scaleratio: 1
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 }
    };
    
    Plotly.newPlot(graphContainer, [], layout, { responsive: true });
    graph = graphContainer;
}

// Update operations dropdown based on selected shape
function updateOperations() {
    currentShape = shapeSelect.value;
    operationSelect.innerHTML = '';
    
    const shapeOperations = operations[currentShape];
    
    for (const opKey in shapeOperations) {
        const option = document.createElement('option');
        option.value = opKey;
        option.textContent = shapeOperations[opKey].name;
        operationSelect.appendChild(option);
    }
    
    updateForm();
}

// Update form fields based on selected operation
function updateForm() {
    currentOperation = operationSelect.value;
    const operationConfig = operations[currentShape][currentOperation];
    
    dynamicForm.innerHTML = '';
    
    operationConfig.fields.forEach(field => {
        if (field.type === 'point') {
            createPointInput(field.id, field.label);
        } else if (field.type === 'number') {
            createNumberInput(field.id, field.label, field.min, field.step);
        } else if (field.type === 'polygon') {
            createPolygonInput(field.id, field.label);
        }
    });
    
    // Update formula explanation if learn mode is enabled
    if (learnModeToggle.checked) {
        showFormula(operationConfig.formula, operationConfig.explanation);
    }
}

// Create input fields for a point
function createPointInput(id, label) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const labelElement = document.createElement('label');
    labelElement.className = 'form-label';
    labelElement.textContent = label;
    container.appendChild(labelElement);
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'point-input-group';
    
    const xLabel = document.createElement('label');
    xLabel.textContent = 'X:';
    inputGroup.appendChild(xLabel);
    
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.className = 'form-control';
    xInput.id = `${id}_x`;
    xInput.step = 'any';
    inputGroup.appendChild(xInput);
    
    const yLabel = document.createElement('label');
    yLabel.textContent = 'Y:';
    inputGroup.appendChild(yLabel);
    
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.className = 'form-control';
    yInput.id = `${id}_y`;
    yInput.step = 'any';
    inputGroup.appendChild(yInput);
    
    container.appendChild(inputGroup);
    dynamicForm.appendChild(container);
}

// Create input field for a number
function createNumberInput(id, label, min, step) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const labelElement = document.createElement('label');
    labelElement.className = 'form-label';
    labelElement.textContent = label;
    labelElement.htmlFor = id;
    container.appendChild(labelElement);
    
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control';
    input.id = id;
    if (min !== undefined) input.min = min;
    if (step !== undefined) input.step = step;
    
    container.appendChild(input);
    dynamicForm.appendChild(container);
}

// Create input for polygon points
function createPolygonInput(id, label) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const labelElement = document.createElement('label');
    labelElement.className = 'form-label';
    labelElement.textContent = label;
    container.appendChild(labelElement);
    
    // Points list
    const pointsList = document.createElement('div');
    pointsList.className = 'polygon-points-list mb-3';
    pointsList.id = 'polygonPointsList';
    
    // Add point form
    const addPointForm = document.createElement('div');
    addPointForm.className = 'mb-3';
    
    const pointInputGroup = document.createElement('div');
    pointInputGroup.className = 'point-input-group';
    
    const xLabel = document.createElement('label');
    xLabel.textContent = 'X:';
    pointInputGroup.appendChild(xLabel);
    
    const xInput = document.createElement('input');
    xInput.type = 'number';
    xInput.className = 'form-control';
    xInput.id = 'new_point_x';
    xInput.step = 'any';
    pointInputGroup.appendChild(xInput);
    
    const yLabel = document.createElement('label');
    yLabel.textContent = 'Y:';
    pointInputGroup.appendChild(yLabel);
    
    const yInput = document.createElement('input');
    yInput.type = 'number';
    yInput.className = 'form-control';
    yInput.id = 'new_point_y';
    yInput.step = 'any';
    pointInputGroup.appendChild(yInput);
    
    addPointForm.appendChild(pointInputGroup);
    
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = 'btn btn-outline-primary mt-2';
    addBtn.textContent = 'Add Point';
    addBtn.onclick = addPolygonPoint;
    addPointForm.appendChild(addBtn);
    
    container.appendChild(pointsList);
    container.appendChild(addPointForm);
    dynamicForm.appendChild(container);
    
    // Initialize or refresh polygon points list
    refreshPolygonPointsList();
}

// Add a point to the polygon
function addPolygonPoint() {
    const xInput = document.getElementById('new_point_x');
    const yInput = document.getElementById('new_point_y');
    
    if (!xInput.value || !yInput.value) {
        showError('Please enter both X and Y coordinates for the point.');
        return;
    }
    
    const x = parseFloat(xInput.value);
    const y = parseFloat(yInput.value);
    
    polygonPoints.push({ x, y });
    
    // Clear inputs
    xInput.value = '';
    yInput.value = '';
    
    // Refresh the list
    refreshPolygonPointsList();
}

// Remove a point from the polygon
function removePolygonPoint(index) {
    polygonPoints.splice(index, 1);
    refreshPolygonPointsList();
}

// Refresh the polygon points list display
function refreshPolygonPointsList() {
    const pointsList = document.getElementById('polygonPointsList');
    if (!pointsList) return;
    
    pointsList.innerHTML = '';
    
    if (polygonPoints.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-muted';
        emptyMessage.textContent = 'No points added yet. Add at least 3 points to create a polygon.';
        pointsList.appendChild(emptyMessage);
        return;
    }
    
    polygonPoints.forEach((point, index) => {
        const pointItem = document.createElement('div');
        pointItem.className = 'polygon-point-item';
        
        const pointText = document.createElement('span');
        pointText.textContent = `Point ${index + 1}: (${point.x}, ${point.y})`;
        pointItem.appendChild(pointText);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-point-btn';
        removeBtn.innerHTML = '&times;';
        removeBtn.onclick = () => removePolygonPoint(index);
        pointItem.appendChild(removeBtn);
        
        pointsList.appendChild(pointItem);
    });
}

// Perform the calculation based on the selected operation
function performCalculation() {
    const operationConfig = operations[currentShape][currentOperation];
    
    try {
        // Prepare data for API request
        const data = {};
        
        operationConfig.fields.forEach(field => {
            if (field.type === 'point') {
                const xInput = document.getElementById(`${field.id}_x`);
                const yInput = document.getElementById(`${field.id}_y`);
                
                if (!xInput.value || !yInput.value) {
                    throw new Error(`Please enter both X and Y coordinates for ${field.label}.`);
                }
                
                data[field.id] = {
                    x: parseFloat(xInput.value),
                    y: parseFloat(yInput.value)
                };
            } else if (field.type === 'number') {
                const input = document.getElementById(field.id);
                
                if (!input.value) {
                    throw new Error(`Please enter a value for ${field.label}.`);
                }
                
                data[field.id] = parseFloat(input.value);
            } else if (field.type === 'polygon') {
                if (polygonPoints.length < 3 && currentShape === 'polygon') {
                    throw new Error('Please add at least 3 points to create a polygon.');
                }
                
                if (polygonPoints.length < 1 && currentShape === 'transform') {
                    throw new Error('Please add at least 1 point to transform.');
                }
                
                data.points = polygonPoints;
            }
        });
        
        // Special case for line operations with two lines
        if (currentOperation === 'parallel' || currentOperation === 'perpendicular' || 
            currentOperation === 'angle' || currentOperation === 'intersection') {
            data.line1 = {
                point1: data.line1_point1,
                point2: data.line1_point2
            };
            data.line2 = {
                point1: data.line2_point1,
                point2: data.line2_point2
            };
            
            delete data.line1_point1;
            delete data.line1_point2;
            delete data.line2_point1;
            delete data.line2_point2;
        }
        
        // Special case for circle-line intersection
        if (currentOperation === 'line_intersection' && currentShape === 'circle') {
            data.line = {
                point1: data.line_point1,
                point2: data.line_point2
            };
            
            delete data.line_point1;
            delete data.line_point2;
        }
        
        // Special case for circle contains point
        if (currentOperation === 'contains' && currentShape === 'circle') {
            data.point = data.test_point;
            delete data.test_point;
        }
        
        // Special case for reflection
        if (currentOperation === 'reflect' && currentShape === 'transform') {
            data.line = {
                point1: data.line_point1,
                point2: data.line_point2
            };
            
            delete data.line_point1;
            delete data.line_point2;
        }
        
        // Make API request
        fetch(operationConfig.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayResults(data.result);
            } else {
                showError(data.error || 'An error occurred during calculation.');
            }
        })
        .catch(error => {
            showError('Network error: ' + error.message);
        });
    } catch (error) {
        showError(error.message);
    }
}

// Display calculation results
function displayResults(result) {
    // Clear previous results
    resultText.innerHTML = '';
    
    // Create result display based on operation type
    const resultTitle = document.createElement('h4');
    resultTitle.textContent = 'Calculation Results';
    resultText.appendChild(resultTitle);
    
    // Create result content based on operation
    const resultContent = document.createElement('div');
    
    switch (currentShape) {
        case 'point':
            displayPointResults(result, resultContent);
            break;
        case 'line':
            displayLineResults(result, resultContent);
            break;
        case 'circle':
            displayCircleResults(result, resultContent);
            break;
        case 'triangle':
            displayTriangleResults(result, resultContent);
            break;
        case 'polygon':
            displayPolygonResults(result, resultContent);
            break;
        case 'transform':
            displayTransformResults(result, resultContent);
            break;
    }
    
    resultText.appendChild(resultContent);
    
    // Update graph
    updateGraph(result);
}

// Display point operation results
function displayPointResults(result, container) {
    switch (currentOperation) {
        case 'distance':
            container.innerHTML = `
                <p>Distance between points (${result.point1.x}, ${result.point1.y}) and (${result.point2.x}, ${result.point2.y}):</p>
                <p class="formula">${result.distance.toFixed(4)}</p>
            `;
            break;
        case 'midpoint':
            container.innerHTML = `
                <p>Midpoint between points (${result.point1.x}, ${result.point1.y}) and (${result.point2.x}, ${result.point2.y}):</p>
                <p class="formula">(${result.midpoint.x.toFixed(4)}, ${result.midpoint.y.toFixed(4)})</p>
            `;
            break;
        case 'section':
            container.innerHTML = `
                <p>Point dividing the line from (${result.point1.x}, ${result.point1.y}) to (${result.point2.x}, ${result.point2.y}) in ratio ${result.ratio}:</p>
                <p class="formula">(${result.section_point.x.toFixed(4)}, ${result.section_point.y.toFixed(4)})</p>
            `;
            break;
    }
}

// Display line operation results
function displayLineResults(result, container) {
    switch (currentOperation) {
        case 'create':
            container.innerHTML = `
                <p>Line through points (${result.point1.x}, ${result.point1.y}) and (${result.point2.x}, ${result.point2.y}):</p>
                <p class="formula">Equation: ${result.equation}</p>
                <p>Slope: ${result.slope !== null ? result.slope.toFixed(4) : 'Undefined (vertical line)'}</p>
                <p>Length: ${result.length.toFixed(4)}</p>
            `;
            break;
        case 'slope':
            container.innerHTML = `
                <p>Slope of line through points (${result.line.point1.x}, ${result.line.point1.y}) and (${result.line.point2.x}, ${result.line.point2.y}):</p>
                <p class="formula">${result.slope !== null ? result.slope.toFixed(4) : 'Undefined (vertical line)'}</p>
            `;
            break;
        case 'equation':
            container.innerHTML = `
                <p>Equation of line through points (${result.line.point1.x}, ${result.line.point1.y}) and (${result.line.point2.x}, ${result.line.point2.y}):</p>
                <p class="formula">${result.equation}</p>
            `;
            break;
        case 'parallel':
            container.innerHTML = `
                <p>Line 1: Through (${result.line1.point1.x}, ${result.line1.point1.y}) and (${result.line1.point2.x}, ${result.line1.point2.y})</p>
                <p>Line 2: Through (${result.line2.point1.x}, ${result.line2.point1.y}) and (${result.line2.point2.x}, ${result.line2.point2.y})</p>
                <p>Are the lines parallel? <strong>${result.is_parallel ? 'Yes' : 'No'}</strong></p>
            `;
            break;
        case 'perpendicular':
            container.innerHTML = `
                <p>Line 1: Through (${result.line1.point1.x}, ${result.line1.point1.y}) and (${result.line1.point2.x}, ${result.line1.point2.y})</p>
                <p>Line 2: Through (${result.line2.point1.x}, ${result.line2.point1.y}) and (${result.line2.point2.x}, ${result.line2.point2.y})</p>
                <p>Are the lines perpendicular? <strong>${result.is_perpendicular ? 'Yes' : 'No'}</strong></p>
            `;
            break;
        case 'angle':
            container.innerHTML = `
                <p>Line 1: Through (${result.line1.point1.x}, ${result.line1.point1.y}) and (${result.line1.point2.x}, ${result.line1.point2.y})</p>
                <p>Line 2: Through (${result.line2.point1.x}, ${result.line2.point1.y}) and (${result.line2.point2.x}, ${result.line2.point2.y})</p>
                <p>Angle between the lines: <strong>${result.angle.toFixed(4)}°</strong></p>
            `;
            break;
        case 'intersection':
            let intersectionText = '';
            if (result.intersection) {
                intersectionText = `<p>Intersection point: <strong>(${result.intersection.x.toFixed(4)}, ${result.intersection.y.toFixed(4)})</strong></p>`;
            } else {
                intersectionText = '<p>The lines are parallel and do not intersect.</p>';
            }
            
            container.innerHTML = `
                <p>Line 1: Through (${result.line1.point1.x}, ${result.line1.point1.y}) and (${result.line1.point2.x}, ${result.line1.point2.y})</p>
                <p>Line 2: Through (${result.line2.point1.x}, ${result.line2.point1.y}) and (${result.line2.point2.x}, ${result.line2.point2.y})</p>
                ${intersectionText}
            `;
            break;
    }
}

// Display circle operation results
function displayCircleResults(result, container) {
    switch (currentOperation) {
        case 'create':
            container.innerHTML = `
                <p>Circle with center (${result.center.x}, ${result.center.y}) and radius ${result.radius}:</p>
                <p class="formula">Equation: ${result.equation}</p>
                <p>Area: ${result.area.toFixed(4)}</p>
                <p>Circumference: ${result.circumference.toFixed(4)}</p>
            `;
            break;
        case 'area':
            container.innerHTML = `
                <p>Area of circle with center (${result.circle.center.x}, ${result.circle.center.y}) and radius ${result.circle.radius}:</p>
                <p class="formula">${result.area.toFixed(4)}</p>
            `;
            break;
        case 'circumference':
            container.innerHTML = `
                <p>Circumference of circle with center (${result.circle.center.x}, ${result.circle.center.y}) and radius ${result.circle.radius}:</p>
                <p class="formula">${result.circumference.toFixed(4)}</p>
            `;
            break;
        case 'contains':
            container.innerHTML = `
                <p>Circle with center (${result.circle.center.x}, ${result.circle.center.y}) and radius ${result.circle.radius}</p>
                <p>Point: (${result.point.x}, ${result.point.y})</p>
                <p>Is the point inside or on the circle? <strong>${result.contains ? 'Yes' : 'No'}</strong></p>
            `;
            break;
        case 'line_intersection':
            let intersectionText = '';
            if (result.intersections.length === 0) {
                intersectionText = '<p>The line does not intersect the circle.</p>';
            } else if (result.intersections.length === 1) {
                intersectionText = `<p>The line is tangent to the circle at point: <strong>(${result.intersections[0].x.toFixed(4)}, ${result.intersections[0].y.toFixed(4)})</strong></p>`;
            } else {
                intersectionText = `
                    <p>The line intersects the circle at two points:</p>
                    <p>Point 1: <strong>(${result.intersections[0].x.toFixed(4)}, ${result.intersections[0].y.toFixed(4)})</strong></p>
                    <p>Point 2: <strong>(${result.intersections[1].x.toFixed(4)}, ${result.intersections[1].y.toFixed(4)})</strong></p>
                `;
            }
            
            container.innerHTML = `
                <p>Circle with center (${result.circle.center.x}, ${result.circle.center.y}) and radius ${result.circle.radius}</p>
                <p>Line through (${result.line.point1.x}, ${result.line.point1.y}) and (${result.line.point2.x}, ${result.line.point2.y})</p>
                ${intersectionText}
            `;
            break;
    }
}

// Display triangle operation results
function displayTriangleResults(result, container) {
    switch (currentOperation) {
        case 'create':
            container.innerHTML = `
                <p>Triangle with vertices:</p>
                <p>A: (${result.points[0].x}, ${result.points[0].y})</p>
                <p>B: (${result.points[1].x}, ${result.points[1].y})</p>
                <p>C: (${result.points[2].x}, ${result.points[2].y})</p>
                <p>Area: ${result.area.toFixed(4)}</p>
                <p>Perimeter: ${result.perimeter.toFixed(4)}</p>
            `;
            break;
        case 'area':
            container.innerHTML = `
                <p>Area of triangle with vertices:</p>
                <p>A: (${result.triangle.points[0].x}, ${result.triangle.points[0].y})</p>
                <p>B: (${result.triangle.points[1].x}, ${result.triangle.points[1].y})</p>
                <p>C: (${result.triangle.points[2].x}, ${result.triangle.points[2].y})</p>
                <p class="formula">${result.area.toFixed(4)}</p>
            `;
            break;
        case 'centroid':
            container.innerHTML = `
                <p>Centroid of triangle with vertices:</p>
                <p>A: (${result.triangle.points[0].x}, ${result.triangle.points[0].y})</p>
                <p>B: (${result.triangle.points[1].x}, ${result.triangle.points[1].y})</p>
                <p>C: (${result.triangle.points[2].x}, ${result.triangle.points[2].y})</p>
                <p class="formula">Centroid: (${result.centroid.x.toFixed(4)}, ${result.centroid.y.toFixed(4)})</p>
            `;
            break;
        case 'orthocenter':
            container.innerHTML = `
                <p>Orthocenter of triangle with vertices:</p>
                <p>A: (${result.triangle.points[0].x}, ${result.triangle.points[0].y})</p>
                <p>B: (${result.triangle.points[1].x}, ${result.triangle.points[1].y})</p>
                <p>C: (${result.triangle.points[2].x}, ${result.triangle.points[2].y})</p>
                <p class="formula">Orthocenter: (${result.orthocenter ? result.orthocenter.x.toFixed(4) + ', ' + result.orthocenter.y.toFixed(4) : 'Not available'})</p>
            `;
            break;
        case 'circumcenter':
            container.innerHTML = `
                <p>Circumcenter of triangle with vertices:</p>
                <p>A: (${result.triangle.points[0].x}, ${result.triangle.points[0].y})</p>
                <p>B: (${result.triangle.points[1].x}, ${result.triangle.points[1].y})</p>
                <p>C: (${result.triangle.points[2].x}, ${result.triangle.points[2].y})</p>
                <p class="formula">Circumcenter: (${result.circumcenter ? result.circumcenter.x.toFixed(4) + ', ' + result.circumcenter.y.toFixed(4) : 'Not available'})</p>
            `;
            break;
    }
}

// Display polygon operation results
function displayPolygonResults(result, container) {
    switch (currentOperation) {
        case 'create':
            let pointsList = '';
            result.points.forEach((point, index) => {
                pointsList += `<p>Point ${index + 1}: (${point.x}, ${point.y})</p>`;
            });
            
            container.innerHTML = `
                <p>Polygon with vertices:</p>
                ${pointsList}
                <p>Area: ${result.area.toFixed(4)}</p>
                <p>Perimeter: ${result.perimeter.toFixed(4)}</p>
                <p>Is convex: ${result.is_convex ? 'Yes' : 'No'}</p>
            `;
            break;
        case 'area':
            container.innerHTML = `
                <p>Area of polygon:</p>
                <p class="formula">${result.area.toFixed(4)}</p>
            `;
            break;
        case 'perimeter':
            container.innerHTML = `
                <p>Perimeter of polygon:</p>
                <p class="formula">${result.perimeter.toFixed(4)}</p>
            `;
            break;
        case 'centroid':
            container.innerHTML = `
                <p>Centroid of polygon:</p>
                <p class="formula">(${result.centroid.x.toFixed(4)}, ${result.centroid.y.toFixed(4)})</p>
            `;
            break;
        case 'is_convex':
            container.innerHTML = `
                <p>Is the polygon convex?</p>
                <p><strong>${result.is_convex ? 'Yes' : 'No'}</strong></p>
            `;
            break;
    }
}

// Display transformation results
function displayTransformResults(result, container) {
    let originalPointsList = '';
    result.original_points.forEach((point, index) => {
        originalPointsList += `<p>Point ${index + 1}: (${point.x}, ${point.y})</p>`;
    });
    
    let transformedPointsList = '';
    result.transformed_points.forEach((point, index) => {
        transformedPointsList += `<p>Point ${index + 1}: (${point.x.toFixed(4)}, ${point.y.toFixed(4)})</p>`;
    });
    
    switch (currentOperation) {
        case 'translate':
            container.innerHTML = `
                <p>Translation by (${result.dx}, ${result.dy}):</p>
                <div class="row">
                    <div class="col-md-6">
                        <h5>Original Points:</h5>
                        ${originalPointsList}
                    </div>
                    <div class="col-md-6">
                        <h5>Transformed Points:</h5>
                        ${transformedPointsList}
                    </div>
                </div>
            `;
            break;
        case 'rotate':
            container.innerHTML = `
                <p>Rotation around (${result.center.x}, ${result.center.y}) by ${result.angle}°:</p>
                <div class="row">
                    <div class="col-md-6">
                        <h5>Original Points:</h5>
                        ${originalPointsList}
                    </div>
                    <div class="col-md-6">
                        <h5>Transformed Points:</h5>
                        ${transformedPointsList}
                    </div>
                </div>
            `;
            break;
        case 'reflect':
            container.innerHTML = `
                <p>Reflection over line through (${result.line.point1.x}, ${result.line.point1.y}) and (${result.line.point2.x}, ${result.line.point2.y}):</p>
                <div class="row">
                    <div class="col-md-6">
                        <h5>Original Points:</h5>
                        ${originalPointsList}
                    </div>
                    <div class="col-md-6">
                        <h5>Transformed Points:</h5>
                        ${transformedPointsList}
                    </div>
                </div>
            `;
            break;
        case 'scale':
            container.innerHTML = `
                <p>Scaling from (${result.center.x}, ${result.center.y}) by factors ${result.sx} (X) and ${result.sy} (Y):</p>
                <div class="row">
                    <div class="col-md-6">
                        <h5>Original Points:</h5>
                        ${originalPointsList}
                    </div>
                    <div class="col-md-6">
                        <h5>Transformed Points:</h5>
                        ${transformedPointsList}
                    </div>
                </div>
            `;
            break;
    }
}

// Update the graph with calculation results
function updateGraph(result) {
    // Clear previous data
    Plotly.purge(graph);
    
    const traces = [];
    const shapes = [];
    
    // Add traces based on operation type
    switch (currentShape) {
        case 'point':
            addPointTraces(result, traces);
            break;
        case 'line':
            addLineTraces(result, traces, shapes);
            break;
        case 'circle':
            addCircleTraces(result, traces, shapes);
            break;
        case 'triangle':
            addTriangleTraces(result, traces, shapes);
            break;
        case 'polygon':
            addPolygonTraces(result, traces, shapes);
            break;
        case 'transform':
            addTransformTraces(result, traces, shapes);
            break;
    }
    
    // Set up layout
    const layout = {
        title: 'Coordinate Geometry Visualization',
        xaxis: {
            title: 'X',
            zeroline: true,
            gridcolor: '#e6e6e6',
            zerolinecolor: '#000000',
            zerolinewidth: 2
        },
        yaxis: {
            title: 'Y',
            zeroline: true,
            gridcolor: '#e6e6e6',
            zerolinecolor: '#000000',
            zerolinewidth: 2,
            scaleanchor: 'x',
            scaleratio: 1
        },
        showlegend: true,
        legend: {
            x: 1,
            xanchor: 'right',
            y: 1
        },
        margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
        shapes: shapes
    };
    
    // Plot the graph
    Plotly.newPlot(graph, traces, layout, { responsive: true });
}

// Add point traces to the graph
function addPointTraces(result, traces) {
    switch (currentOperation) {
        case 'distance':
            // Add points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Points',
                marker: { size: 10, color: 'blue' }
            });
            
            // Add line connecting points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'lines',
                type: 'scatter',
                name: 'Distance',
                line: { dash: 'solid', width: 2, color: 'red' }
            });
            
            // Add distance label
            const midX = (result.point1.x + result.point2.x) / 2;
            const midY = (result.point1.y + result.point2.y) / 2;
            
            traces.push({
                x: [midX],
                y: [midY],
                mode: 'text',
                type: 'scatter',
                text: [`d = ${result.distance.toFixed(2)}`],
                textposition: 'top center',
                textfont: { size: 12, color: 'black' },
                showlegend: false
            });
            break;
            
        case 'midpoint':
            // Add original points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Original Points',
                marker: { size: 10, color: 'blue' }
            });
            
            // Add line connecting points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'lines',
                type: 'scatter',
                name: 'Line',
                line: { dash: 'solid', width: 2, color: 'gray' }
            });
            
            // Add midpoint
            traces.push({
                x: [result.midpoint.x],
                y: [result.midpoint.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Midpoint',
                marker: { size: 10, color: 'red' },
                text: ['Midpoint'],
                textposition: 'top center'
            });
            break;
            
        case 'section':
            // Add original points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Original Points',
                marker: { size: 10, color: 'blue' }
            });
            
            // Add line connecting points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'lines',
                type: 'scatter',
                name: 'Line',
                line: { dash: 'solid', width: 2, color: 'gray' }
            });
            
            // Add section point
            traces.push({
                x: [result.section_point.x],
                y: [result.section_point.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Section Point',
                marker: { size: 10, color: 'red' },
                text: [`Ratio ${result.ratio}`],
                textposition: 'top center'
            });
            break;
    }
}

// Add line traces to the graph
function addLineTraces(result, traces, shapes) {
    switch (currentOperation) {
        case 'create':
        case 'slope':
        case 'equation':
            // Add points
            traces.push({
                x: [result.point1.x, result.point2.x],
                y: [result.point1.y, result.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Points',
                marker: { size: 10, color: 'blue' }
            });
            
            // Extend line for better visualization
            const line = extendLine(result.point1, result.point2);
            
            // Add line
            traces.push({
                x: [line.x1, line.x2],
                y: [line.y1, line.y2],
                mode: 'lines',
                type: 'scatter',
                name: 'Line',
                line: { dash: 'solid', width: 2, color: 'red' }
            });
            
            // Add equation label
            if (currentOperation === 'equation' || currentOperation === 'create') {
                const labelX = (result.point1.x + result.point2.x) / 2;
                const labelY = (result.point1.y + result.point2.y) / 2 + 0.5;
                
                traces.push({
                    x: [labelX],
                    y: [labelY],
                    mode: 'text',
                    type: 'scatter',
                    text: [currentOperation === 'equation' ? result.equation : result.equation],
                    textposition: 'top center',
                    textfont: { size: 12, color: 'black' },
                    showlegend: false
                });
            }
            break;
            
        case 'parallel':
        case 'perpendicular':
        case 'angle':
        case 'intersection':
            // Add points for line 1
            traces.push({
                x: [result.line1.point1.x, result.line1.point2.x],
                y: [result.line1.point1.y, result.line1.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Line 1 Points',
                marker: { size: 8, color: 'blue' }
            });
            
            // Add points for line 2
            traces.push({
                x: [result.line2.point1.x, result.line2.point2.x],
                y: [result.line2.point1.y, result.line2.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Line 2 Points',
                marker: { size: 8, color: 'green' }
            });
            
            // Extend lines for better visualization
            const line1 = extendLine(result.line1.point1, result.line1.point2);
            const line2 = extendLine(result.line2.point1, result.line2.point2);
            
            // Add line 1
            traces.push({
                x: [line1.x1, line1.x2],
                y: [line1.y1, line1.y2],
                mode: 'lines',
                type: 'scatter',
                name: 'Line 1',
                line: { dash: 'solid', width: 2, color: 'blue' }
            });
            
            // Add line 2
            traces.push({
                x: [line2.x1, line2.x2],
                y: [line2.y1, line2.y2],
                mode: 'lines',
                type: 'scatter',
                name: 'Line 2',
                line: { dash: 'solid', width: 2, color: 'green' }
            });
            
            // Add intersection point if applicable
            if (currentOperation === 'intersection' && result.intersection) {
                traces.push({
                    x: [result.intersection.x],
                    y: [result.intersection.y],
                    mode: 'markers+text',
                    type: 'scatter',
                    name: 'Intersection',
                    marker: { size: 10, color: 'red' },
                    text: ['Intersection'],
                    textposition: 'top center'
                });
            }
            
            // Add angle arc if applicable
            if (currentOperation === 'angle') {
                // Find intersection point
                const intersection = findIntersection(
                    result.line1.point1, result.line1.point2,
                    result.line2.point1, result.line2.point2
                );
                
                if (intersection) {
                    // Calculate angles
                    const angle1 = Math.atan2(
                        result.line1.point2.y - intersection.y,
                        result.line1.point2.x - intersection.x
                    );
                    
                    const angle2 = Math.atan2(
                        result.line2.point2.y - intersection.y,
                        result.line2.point2.x - intersection.x
                    );
                    
                    // Draw angle arc
                    const radius = 1;
                    const startAngle = Math.min(angle1, angle2);
                    const endAngle = Math.max(angle1, angle2);
                    
                    shapes.push({
                        type: 'path',
                        path: getArcPath(intersection.x, intersection.y, radius, startAngle, endAngle),
                        fillcolor: 'rgba(255, 0, 0, 0.2)',
                        line: { color: 'red' }
                    });
                    
                    // Add angle label
                    const midAngle = (angle1 + angle2) / 2;
                    const labelX = intersection.x + radius * 1.5 * Math.cos(midAngle);
                    const labelY = intersection.y + radius * 1.5 * Math.sin(midAngle);
                    
                    traces.push({
                        x: [labelX],
                        y: [labelY],
                        mode: 'text',
                        type: 'scatter',
                        text: [`${result.angle.toFixed(2)}°`],
                        textposition: 'middle center',
                        textfont: { size: 12, color: 'red' },
                        showlegend: false
                    });
                }
            }
            break;
    }
}

// Add circle traces to the graph
function addCircleTraces(result, traces, shapes) {
    switch (currentOperation) {
        case 'create':
        case 'area':
        case 'circumference':
            // Add center point
            traces.push({
                x: [result.circle ? result.circle.center.x : result.center.x],
                y: [result.circle ? result.circle.center.y : result.center.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Center',
                marker: { size: 8, color: 'blue' },
                text: ['Center'],
                textposition: 'top center'
            });
            
            // Add circle
            const center = result.circle ? result.circle.center : result.center;
            const radius = result.circle ? result.circle.radius : result.radius;
            
            shapes.push({
                type: 'circle',
                xref: 'x',
                yref: 'y',
                x0: center.x - radius,
                y0: center.y - radius,
                x1: center.x + radius,
                y1: center.y + radius,
                line: { color: 'blue' },
                fillcolor: 'rgba(0, 0, 255, 0.1)'
            });
            
            // Add radius line
            traces.push({
                x: [center.x, center.x + radius],
                y: [center.y, center.y],
                mode: 'lines+text',
                type: 'scatter',
                name: 'Radius',
                line: { dash: 'dash', width: 2, color: 'red' },
                text: ['', `r = ${radius}`],
                textposition: 'top center',
                showlegend: false
            });
            break;
            
        case 'contains':
            // Add center point
            traces.push({
                x: [result.circle.center.x],
                y: [result.circle.center.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Center',
                marker: { size: 8, color: 'blue' },
                text: ['Center'],
                textposition: 'top center'
            });
            
            // Add circle
            shapes.push({
                type: 'circle',
                xref: 'x',
                yref: 'y',
                x0: result.circle.center.x - result.circle.radius,
                y0: result.circle.center.y - result.circle.radius,
                x1: result.circle.center.x + result.circle.radius,
                y1: result.circle.center.y + result.circle.radius,
                line: { color: 'blue' },
                fillcolor: 'rgba(0, 0, 255, 0.1)'
            });
            
            // Add test point
            traces.push({
                x: [result.point.x],
                y: [result.point.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Test Point',
                marker: { 
                    size: 10, 
                    color: result.contains ? 'green' : 'red',
                    symbol: result.contains ? 'circle' : 'x'
                },
                text: [result.contains ? 'Inside' : 'Outside'],
                textposition: 'top center'
            });
            
            // Add line from center to point
            traces.push({
                x: [result.circle.center.x, result.point.x],
                y: [result.circle.center.y, result.point.y],
                mode: 'lines',
                type: 'scatter',
                name: 'Distance',
                line: { dash: 'dot', width: 2, color: 'gray' }
            });
            break;
            
        case 'line_intersection':
            // Add center point
            traces.push({
                x: [result.circle.center.x],
                y: [result.circle.center.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Center',
                marker: { size: 8, color: 'blue' },
                text: ['Center'],
                textposition: 'top center'
            });
            
            // Add circle
            shapes.push({
                type: 'circle',
                xref: 'x',
                yref: 'y',
                x0: result.circle.center.x - result.circle.radius,
                y0: result.circle.center.y - result.circle.radius,
                x1: result.circle.center.x + result.circle.radius,
                y1: result.circle.center.y + result.circle.radius,
                line: { color: 'blue' },
                fillcolor: 'rgba(0, 0, 255, 0.1)'
            });
            
            // Add line points
            traces.push({
                x: [result.line.point1.x, result.line.point2.x],
                y: [result.line.point1.y, result.line.point2.y],
                mode: 'markers',
                type: 'scatter',
                name: 'Line Points',
                marker: { size: 8, color: 'green' }
            });
            
            // Extend line for better visualization
            const line = extendLine(result.line.point1, result.line.point2);
            
            // Add line
            traces.push({
                x: [line.x1, line.x2],
                y: [line.y1, line.y2],
                mode: 'lines',
                type: 'scatter',
                name: 'Line',
                line: { dash: 'solid', width: 2, color: 'green' }
            });
            
            // Add intersection points
            if (result.intersections.length > 0) {
                const intersectionX = result.intersections.map(p => p.x);
                const intersectionY = result.intersections.map(p => p.y);
                
                traces.push({
                    x: intersectionX,
                    y: intersectionY,
                    mode: 'markers+text',
                    type: 'scatter',
                    name: 'Intersections',
                    marker: { size: 10, color: 'red' },
                    text: result.intersections.map((_, i) => `Intersection ${i+1}`),
                    textposition: 'top center'
                });
            }
            break;
    }
}

// Add triangle traces to the graph
function addTriangleTraces(result, traces, shapes) {
    // Get triangle points
    const points = result.triangle ? result.triangle.points : result.points;
    
    // Add vertices
    traces.push({
        x: points.map(p => p.x),
        y: points.map(p => p.y),
        mode: 'markers+text',
        type: 'scatter',
        name: 'Vertices',
        marker: { size: 10, color: 'blue' },
        text: ['A', 'B', 'C'],
        textposition: 'top center'
    });
    
    // Add triangle sides
    traces.push({
        x: [...points.map(p => p.x), points[0].x],
        y: [...points.map(p => p.y), points[0].y],
        mode: 'lines',
        type: 'scatter',
        name: 'Triangle',
        line: { dash: 'solid', width: 2, color: 'blue' },
        fill: 'toself',
        fillcolor: 'rgba(0, 0, 255, 0.1)'
    });
    
    // Add special points based on operation
    switch (currentOperation) {
        case 'centroid':
            traces.push({
                x: [result.centroid.x],
                y: [result.centroid.y],
                mode: 'markers+text',
                type: 'scatter',
                name: 'Centroid',
                marker: { size: 10, color: 'red' },
                text: ['Centroid'],
                textposition: 'top center'
            });

    }
        










}

