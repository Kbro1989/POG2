import { BinaryHeap, Comparable } from '../utils/BinaryHeap.js';

class TestNode implements Comparable<TestNode> {
  constructor(public id: string, public fScore: number) {}
  compare(other: TestNode): number {
    return this.fScore - other.fScore;
  }
}

function testBinaryHeap() {
  console.log('🧪 BINARY HEAP MINIMAL TEST\n');

  const heap = new BinaryHeap<TestNode>();

  // 1. Insert nodes in non-sorted order
  heap.insert(new TestNode('A', 50));
  heap.insert(new TestNode('B', 10));
  heap.insert(new TestNode('C', 80));
  heap.insert(new TestNode('D', 5));
  heap.insert(new TestNode('E', 30));

  console.log(`[HEAP] Size after inserts: ${heap.size()}`);
  console.log(`[HEAP] Valid property: ${heap.verifyHeapProperty() ? '✓' : '✗'}`);

  // 2. Peek should be the minimum (5)
  const top = heap.peek();
  console.log(`[HEAP] Peek min: id=${top?.id}, fScore=${top?.fScore} (Expected 5)`);

  // 3. Pop should return in ascending order: 5, 10, 30, 50, 80
  const expectedScores = [5, 10, 30, 50, 80];
  const actualScores: number[] = [];

  while (!heap.isEmpty()) {
    const node = heap.pop()!;
    actualScores.push(node.fScore);
    console.log(`[HEAP] Pop: id=${node.id}, fScore=${node.fScore}`);
  }

  const match = JSON.stringify(expectedScores) === JSON.stringify(actualScores);
  console.log(`\n[RESULT] Final Scores: [${actualScores.join(', ')}]`);
  console.log(`[RESULT] Ascending match: ${match ? '✓ SUCCESS' : '✗ FAILED'}`);

  if (!match) {
    process.exit(1);
  }
}

testBinaryHeap();

