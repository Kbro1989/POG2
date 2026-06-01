export interface Comparable<T> {
  compare(other: T): number; // Return < 0 if this < other, > 0 if this > other
}

/**
 * BinaryHeap - Generic Min-Heap implementation for Priority Queues.
 * O(log n) insertion and deletion.
 */
export class BinaryHeap<T extends Comparable<T>> {
  private heap: T[] = [];

  /**
   * Insert element into heap. O(log n).
   */
  insert(element: T): void {
    this.heap.push(element);
    this.bubbleUp(this.heap.length - 1);
  }

  /**
   * Extract min element. O(log n).
   */
  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min;
  }

  /**
   * Peek at min element without removing. O(1).
   */
  peek(): T | undefined {
    return this.heap[0];
  }

  /**
   * Check if heap is empty.
   */
  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  /**
   * Heap size.
   */
  size(): number {
    return this.heap.length;
  }

  /**
   * Clear the heap.
   */
  clear(): void {
    this.heap = [];
  }

  /**
   * Bubble up from index. Maintains min-heap property.
   */
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].compare(this.heap[parentIndex]) >= 0) break;

      this.swap(index, parentIndex);
      index = parentIndex;
    }
  }

  /**
   * Bubble down from index. Maintains min-heap property.
   */
  private bubbleDown(index: number): void {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < this.heap.length &&
        this.heap[leftChild].compare(this.heap[smallest]) < 0
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[rightChild].compare(this.heap[smallest]) < 0
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      this.swap(index, smallest);
      index = smallest;
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i];
    this.heap[i] = this.heap[j];
    this.heap[j] = temp;
  }

  /**
   * DEBUG: Verify min-heap property.
   */
  verifyHeapProperty(): boolean {
    for (let i = 0; i < this.heap.length; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;

      if (
        leftChild < this.heap.length &&
        this.heap[i].compare(this.heap[leftChild]) > 0
      ) {
        return false;
      }

      if (
        rightChild < this.heap.length &&
        this.heap[i].compare(this.heap[rightChild]) > 0
      ) {
        return false;
      }
    }
    return true;
  }
}

