function main() {
  const input = new InputTranslator(document.getElementById('stl').value);
  const output = new Output(input.getShapesFromInput());
  output.generateValues();
  output.generateOutput();
}

class Shape {
  constructor(points) {
    this.points = points.map(x => x.map(y => parseInt(y, 10)));

    if (this.constructor === Shape) {
      throw new TypeError(
        `Abstract class ${this.constructor.name} cannot be instantiated directly.`,
      );
    }
  }

  calculateArea() {
    throw new Error('Subclass Responsibility!');
  }
}

class Triangle extends Shape {
  constructor(points) {
    super(points);
  }

  calculateArea() {
    const origin = this.points[0];
    const vectorA = this.points[1].map((x, i) => x - origin[i]);
    const vectorB = this.points[2].map((x, i) => x - origin[i]);

    const crossProd = getCrossProductBetweenTwoVectors(vectorA, vectorB);

    const squared = crossProd.map(x => Math.pow(x, 2));
    const sum = squared.reduce((total, amount) => total + amount);
    this.area = 0.5 * Math.sqrt(sum);
  }
}

class InputTranslator {
  constructor(inputString) {
    this.lines = inputString
      .trim()
      .split('\n')
      .filter(x => !x.trim().includes(TERMS.SOLID));
  }

  getShapesFromInput() {
    const shapeIndices = [];
    const shapesArray = [];

    this.lines.forEach((element, index) => {
      if (element.trim().includes(TERMS.FACET_NORMAL)) {
        shapeIndices.push(index);
      }
      if (
        element.trim() === TERMS.END_FACET ||
        element.trim() === TERMS.ENDFACET
      ) {
        shapeIndices.push(index);
      }
    });

    for (var i = 0; i < shapeIndices.length; i = i + 2) {
      shapesArray.push(this.lines.slice(shapeIndices[i], shapeIndices[i + 1]));
    }

    const generatedShapes = [];

    shapesArray.forEach(x => {
      let corners = x.filter(y => y.includes(TERMS.VERTEX));
      let trimmed = [];
      corners.forEach(z => {
        let clean = z.trim().split(' ');
        trimmed.push(clean.slice(1));
      });
      switch (trimmed.length) {
        case 3: {
          const newShape = new Triangle(trimmed);
          newShape.calculateArea();
          generatedShapes.push(newShape);
          break;
        }
        default:
          break;
      }
    });

    return generatedShapes;
  }
}

class Output {
  constructor(shapes) {
    this.shapes = shapes;

    this.totalArea = 0;
    this.boundingBox = [];
  }

  incrementShapeCount(x) {
    if (this[x.constructor.name.toLowerCase()] === undefined) {
      this[x.constructor.name.toLowerCase()] = 1;
    } else {
      this[x.constructor.name.toLowerCase()]++;
    }
  }

  incrementArea(x) {
    this.totalArea = this.totalArea + x.area;
  }

  // Going with Axis Aligned Minimum Bounding Box
  createMinimumBoundingBox(x) {
    let minPoint = [];
    let maxPoint = [];
    x.points.forEach(y => {
      y.forEach((z, i) => {
        if (minPoint[i] === undefined || minPoint[i] > z) {
          minPoint[i] = z;
        }
        if (maxPoint[i] === undefined || maxPoint[i] < z) {
          maxPoint[i] = z;
        }
      });
    });
    this.boundingBox = [
      minPoint,
      [minPoint[0], minPoint[1], maxPoint[2]],
      [minPoint[0], maxPoint[1], minPoint[2]],
      [maxPoint[0], minPoint[1], minPoint[2]],
      [maxPoint[0], maxPoint[1], minPoint[2]],
      [maxPoint[0], minPoint[1], maxPoint[2]],
      [minPoint[0], maxPoint[1], maxPoint[2]],
      maxPoint,
    ];
  }

  generateValues() {
    this.shapes.forEach(x => {
      this.incrementShapeCount(x);
      this.incrementArea(x);
      this.createMinimumBoundingBox(x);
    });
  }

  generateOutput() {
    let dimensionedBB = this.boundingBox.map(
      x => `{ x: ${x[0]}, y: ${x[1]}, z: ${x[2]}}`,
    );
    let outputBB = dimensionedBB.join('\n');
    const outputString = `Number of Triangles: ${this.triangle}
Surface Area: ${this.totalArea.toFixed(4)}
Bounding Box: ${outputBB}`;

    document.getElementById('output').innerHTML = outputString;
  }
}

function getCrossProductBetweenTwoVectors(a, b) {
  let i = a[1] * b[2] - a[2] * b[1];
  let j = a[0] * b[2] - a[2] * b[0];
  let k = a[0] * b[1] - a[1] * b[0];

  return [i, j, k];
}

const TERMS = {
  ENDFACET: 'endfacet',
  END_FACET: 'end facet',
  VERTEX: 'vertex',
  FACET_NORMAL: 'facet normal',
  SOLID: 'solid',
};
