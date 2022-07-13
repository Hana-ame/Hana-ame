# Deque/双向队列
<table class="striped">
 <caption>Summary of Deque methods</caption>
  <thead>
  <tr>
    <td rowspan="2"></td>
    <th scope="col" colspan="2"> First Element (Head)</th>
    <th scope="col" colspan="2"> Last Element (Tail)</th>
  </tr>
  <tr>
    <th scope="col" style="font-weight:normal; font-style:italic">Throws exception</th>
    <th scope="col" style="font-weight:normal; font-style:italic">Special value</th>
    <th scope="col" style="font-weight:normal; font-style:italic">Throws exception</th>
    <th scope="col" style="font-weight:normal; font-style:italic">Special value</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="row">Insert</th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#addFirst(E)"><code>addFirst(e)</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#offerFirst(E)"><code>offerFirst(e)</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#addLast(E)"><code>addLast(e)</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#offerLast(E)"><code>offerLast(e)</code></a></td>
  </tr>
  <tr>
    <th scope="row">Remove</th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#removeFirst()"><code>removeFirst()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#pollFirst()"><code>pollFirst()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#removeLast()"><code>removeLast()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#pollLast()"><code>pollLast()</code></a></td>
  </tr>
  <tr>
    <th scope="row">Examine</th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#getFirst()"><code>getFirst()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#peekFirst()"><code>peekFirst()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#getLast()"><code>getLast()</code></a></td>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#peekLast()"><code>peekLast()</code></a></td>
  </tr>
  </tbody>
 </table>


<table class="striped">
 <caption>Comparison of Queue and Deque methods</caption>
  <thead>
  <tr>
    <th scope="col"> <code>Queue</code> Method</th>
    <th scope="col"> Equivalent <code>Deque</code> Method</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#add(E)"><code>add(e)</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#addLast(E)"><code>addLast(e)</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#offer(E)"><code>offer(e)</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#offerLast(E)"><code>offerLast(e)</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#remove()"><code>remove()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#removeFirst()"><code>removeFirst()</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#poll()"><code>poll()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#pollFirst()"><code>pollFirst()</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#element()"><code>element()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#getFirst()"><code>getFirst()</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#peek()"><code>peek()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#peekFirst()"><code>peekFirst()</code></a></td>
  </tr>
  </tbody>
 </table>


<table class="striped">
 <caption>Comparison of Stack and Deque methods</caption>
  <thead>
  <tr>
    <th scope="col"> Stack Method</th>
    <th scope="col"> Equivalent <code>Deque</code> Method</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#push(E)"><code>push(e)</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#addFirst(E)"><code>addFirst(e)</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#pop()"><code>pop()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#removeFirst()"><code>removeFirst()</code></a></td>
  </tr>
  <tr>
    <th scope="row"><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#peek()"><code>peek()</code></a></th>
    <td><a href="https://docs.oracle.com/en/java/javase/14/docs/api/java.base/java/util/Deque.html#getFirst()"><code>getFirst()</code></a></td>
  </tr>
  </tbody>
 </table>


# 