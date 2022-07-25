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


# TreeMap
<li class="blockList">
<section class="methodSummary"><a id="method.summary">
<!--   -->
</a>
<h2>Method Summary</h2>
<div class="memberSummary">
<!-- <div role="tablist" aria-orientation="horizontal"><button role="tab" aria-selected="true" aria-controls="memberSummary_tabpanel" tabindex="0" onkeydown="switchTab(event)" id="t0" class="activeTableTab" onclick="show(65535)">All Methods</button><button role="tab" aria-selected="false" aria-controls="memberSummary_tabpanel" tabindex="-1" onkeydown="switchTab(event)" id="t2" class="tableTab" onclick="show(2)">Instance Methods</button><button role="tab" aria-selected="false" aria-controls="memberSummary_tabpanel" tabindex="-1" onkeydown="switchTab(event)" id="t4" class="tableTab" onclick="show(8)">Concrete Methods</button></div>
<div id="memberSummary_tabpanel" role="tabpanel"> -->
<table aria-labelledby="t0">
<thead>
<tr>
<th class="colFirst" scope="col">Modifier and Type</th>
<th class="colSecond" scope="col">Method</th>
<th class="colLast" scope="col">Description</th>
</tr>
</thead>
<tbody>
<tr class="altColor" id="i0">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#ceilingEntry(K)">ceilingEntry</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the least key
 greater than or equal to the given key, or <code>null</code> if
 there is no such key.</div>
</td>
</tr>
<!-- <tr class="rowColor" id="i1">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#ceilingKey(K)">ceilingKey</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns the least key greater than or equal to the given key,
 or <code>null</code> if there is no such key.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i2">
<td class="colFirst"><code>void</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#clear()">clear</a></span>()</code></th>
<td class="colLast">
<div class="block">Removes all of the mappings from this map.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i3">
<td class="colFirst"><code><a href="../lang/Object.html" title="class in java.lang">Object</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#clone()">clone</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a shallow copy of this <code>TreeMap</code> instance.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i4">
<td class="colFirst"><code>boolean</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#containsKey(java.lang.Object)">containsKey</a></span>​(<a href="../lang/Object.html" title="class in java.lang">Object</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns <code>true</code> if this map contains a mapping for the specified
 key.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i5">
<td class="colFirst"><code>boolean</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#containsValue(java.lang.Object)">containsValue</a></span>​(<a href="../lang/Object.html" title="class in java.lang">Object</a>&nbsp;value)</code></th>
<td class="colLast">
<div class="block">Returns <code>true</code> if this map maps one or more keys to the
 specified value.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i6">
<td class="colFirst"><code><a href="NavigableSet.html" title="interface in java.util">NavigableSet</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#descendingKeySet()">descendingKeySet</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a reverse order <a href="NavigableSet.html" title="interface in java.util"><code>NavigableSet</code></a> view of the keys contained in this map.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i7">
<td class="colFirst"><code><a href="NavigableMap.html" title="interface in java.util">NavigableMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#descendingMap()">descendingMap</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a reverse order view of the mappings contained in this map.</div>
</td>
</tr> -->
<tr class="altColor" id="i8">
<td class="colFirst"><code><a href="Set.html" title="interface in java.util">Set</a>&lt;<a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#entrySet()">entrySet</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a <a href="Set.html" title="interface in java.util"><code>Set</code></a> view of the mappings contained in this map.</div>
</td>
</tr>
<tr class="rowColor" id="i9">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#firstEntry()">firstEntry</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the least
 key in this map, or <code>null</code> if the map is empty.</div>
</td>
</tr>
<!-- <tr class="altColor" id="i10">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#firstKey()">firstKey</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns the first (lowest) key currently in this map.</div>
</td>
</tr> -->
<tr class="rowColor" id="i11">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#floorEntry(K)">floorEntry</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the greatest key
 less than or equal to the given key, or <code>null</code> if there
 is no such key.</div>
</td>
</tr>
<!-- <tr class="altColor" id="i12">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#floorKey(K)">floorKey</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns the greatest key less than or equal to the given key,
 or <code>null</code> if there is no such key.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i13">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">V</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#get(java.lang.Object)">get</a></span>​(<a href="../lang/Object.html" title="class in java.lang">Object</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns the value to which the specified key is mapped,
 or <code>null</code> if this map contains no mapping for the key.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i14">
<td class="colFirst"><code><a href="SortedMap.html" title="interface in java.util">SortedMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#headMap(K)">headMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;toKey)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys are
 strictly less than <code>toKey</code>.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i15">
<td class="colFirst"><code><a href="NavigableMap.html" title="interface in java.util">NavigableMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#headMap(K,boolean)">headMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;toKey,
boolean&nbsp;inclusive)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys are less than (or
 equal to, if <code>inclusive</code> is true) <code>toKey</code>.</div>
</td>
</tr> -->
<tr class="altColor" id="i16">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#higherEntry(K)">higherEntry</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the least key
 strictly greater than the given key, or <code>null</code> if there
 is no such key.</div>
</td>
</tr>
<!-- <tr class="rowColor" id="i17">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#higherKey(K)">higherKey</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns the least key strictly greater than the given key, or
 <code>null</code> if there is no such key.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i18">
<td class="colFirst"><code><a href="Set.html" title="interface in java.util">Set</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#keySet()">keySet</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a <a href="Set.html" title="interface in java.util"><code>Set</code></a> view of the keys contained in this map.</div>
</td>
</tr> -->
<tr class="rowColor" id="i19">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#lastEntry()">lastEntry</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the greatest
 key in this map, or <code>null</code> if the map is empty.</div>
</td>
</tr>
<!-- <tr class="altColor" id="i20">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#lastKey()">lastKey</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns the last (highest) key currently in this map.</div>
</td>
</tr> -->
<tr class="rowColor" id="i21">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#lowerEntry(K)">lowerEntry</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns a key-value mapping associated with the greatest key
 strictly less than the given key, or <code>null</code> if there is
 no such key.</div>
</td>
</tr>
<!-- <tr class="altColor" id="i22">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">K</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#lowerKey(K)">lowerKey</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Returns the greatest key strictly less than the given key, or
 <code>null</code> if there is no such key.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i23">
<td class="colFirst"><code><a href="NavigableSet.html" title="interface in java.util">NavigableSet</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#navigableKeySet()">navigableKeySet</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a <a href="NavigableSet.html" title="interface in java.util"><code>NavigableSet</code></a> view of the keys contained in this map.</div>
</td>
</tr> -->
<tr class="altColor" id="i24">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#pollFirstEntry()">pollFirstEntry</a></span>()</code></th>
<td class="colLast">
<div class="block">Removes and returns a key-value mapping associated with
 the least key in this map, or <code>null</code> if the map is empty.</div>
</td>
</tr>
<tr class="rowColor" id="i25">
<td class="colFirst"><code><a href="Map.Entry.html" title="interface in java.util">Map.Entry</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#pollLastEntry()">pollLastEntry</a></span>()</code></th>
<td class="colLast">
<div class="block">Removes and returns a key-value mapping associated with
 the greatest key in this map, or <code>null</code> if the map is empty.</div>
</td>
</tr>
<tr class="altColor" id="i26">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">V</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#put(K,V)">put</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;key,
<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&nbsp;value)</code></th>
<td class="colLast">
<div class="block">Associates the specified value with the specified key in this map.</div>
</td>
</tr>
<tr class="rowColor" id="i27">
<td class="colFirst"><code>void</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#putAll(java.util.Map)">putAll</a></span>​(<a href="Map.html" title="interface in java.util">Map</a>&lt;? extends <a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​? extends <a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;&nbsp;map)</code></th>
<td class="colLast">
<div class="block">Copies all of the mappings from the specified map to this map.</div>
</td>
</tr>
<tr class="altColor" id="i28">
<td class="colFirst"><code><a href="TreeMap.html" title="type parameter in TreeMap">V</a></code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#remove(java.lang.Object)">remove</a></span>​(<a href="../lang/Object.html" title="class in java.lang">Object</a>&nbsp;key)</code></th>
<td class="colLast">
<div class="block">Removes the mapping for this key from this TreeMap if present.</div>
</td>
</tr>
<!-- <tr class="rowColor" id="i29">
<td class="colFirst"><code>int</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#size()">size</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns the number of key-value mappings in this map.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i30">
<td class="colFirst"><code><a href="NavigableMap.html" title="interface in java.util">NavigableMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#subMap(K,boolean,K,boolean)">subMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;fromKey,
boolean&nbsp;fromInclusive,
<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;toKey,
boolean&nbsp;toInclusive)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys range from
 <code>fromKey</code> to <code>toKey</code>.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i31">
<td class="colFirst"><code><a href="SortedMap.html" title="interface in java.util">SortedMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#subMap(K,K)">subMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;fromKey,
<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;toKey)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys range from
 <code>fromKey</code>, inclusive, to <code>toKey</code>, exclusive.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i32">
<td class="colFirst"><code><a href="SortedMap.html" title="interface in java.util">SortedMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#tailMap(K)">tailMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;fromKey)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys are
 greater than or equal to <code>fromKey</code>.</div>
</td>
</tr> -->
<!-- <tr class="rowColor" id="i33">
<td class="colFirst"><code><a href="NavigableMap.html" title="interface in java.util">NavigableMap</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">K</a>,​<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#tailMap(K,boolean)">tailMap</a></span>​(<a href="TreeMap.html" title="type parameter in TreeMap">K</a>&nbsp;fromKey,
boolean&nbsp;inclusive)</code></th>
<td class="colLast">
<div class="block">Returns a view of the portion of this map whose keys are greater than (or
 equal to, if <code>inclusive</code> is true) <code>fromKey</code>.</div>
</td>
</tr> -->
<!-- <tr class="altColor" id="i34">
<td class="colFirst"><code><a href="Collection.html" title="interface in java.util">Collection</a>&lt;<a href="TreeMap.html" title="type parameter in TreeMap">V</a>&gt;</code></td>
<th class="colSecond" scope="row"><code><span class="memberNameLink"><a href="#values()">values</a></span>()</code></th>
<td class="colLast">
<div class="block">Returns a <a href="Collection.html" title="interface in java.util"><code>Collection</code></a> view of the values contained in this map.</div>
</td>
</tr> -->
</tbody>
</table>
</div>
</div>
<div class="inheritedList">
<h3>Methods declared in class&nbsp;java.util.<a href="AbstractMap.html" title="class in java.util">AbstractMap</a></h3>
<a id="methods.inherited.from.class.java.util.AbstractMap">
<!--   -->
</a><code><a href="AbstractMap.html#equals(java.lang.Object)">equals</a>, <a href="AbstractMap.html#hashCode()">hashCode</a>, <a href="AbstractMap.html#isEmpty()">isEmpty</a>, <a href="AbstractMap.html#toString()">toString</a></code></div>
<div class="inheritedList">
<h3>Methods declared in class&nbsp;java.lang.<a href="../lang/Object.html" title="class in java.lang">Object</a></h3>
<a id="methods.inherited.from.class.java.lang.Object">
<!--   -->
</a><code><a href="../lang/Object.html#finalize()">finalize</a>, <a href="../lang/Object.html#getClass()">getClass</a>, <a href="../lang/Object.html#notify()">notify</a>, <a href="../lang/Object.html#notifyAll()">notifyAll</a>, <a href="../lang/Object.html#wait()">wait</a>, <a href="../lang/Object.html#wait(long)">wait</a>, <a href="../lang/Object.html#wait(long,int)">wait</a></code></div>
<div class="inheritedList">
<h3>Methods declared in interface&nbsp;java.util.<a href="Map.html" title="interface in java.util">Map</a></h3>
<a id="methods.inherited.from.class.java.util.Map">
<!--   -->
</a><code><a href="Map.html#compute(K,java.util.function.BiFunction)">compute</a>, <a href="Map.html#computeIfAbsent(K,java.util.function.Function)">computeIfAbsent</a>, <a href="Map.html#computeIfPresent(K,java.util.function.BiFunction)">computeIfPresent</a>, <a href="Map.html#equals(java.lang.Object)">equals</a>, <a href="Map.html#forEach(java.util.function.BiConsumer)">forEach</a>, <a href="Map.html#getOrDefault(java.lang.Object,V)">getOrDefault</a>, <a href="Map.html#hashCode()">hashCode</a>, <a href="Map.html#isEmpty()">isEmpty</a>, <a href="Map.html#merge(K,V,java.util.function.BiFunction)">merge</a>, <a href="Map.html#putIfAbsent(K,V)">putIfAbsent</a>, <a href="Map.html#remove(java.lang.Object,java.lang.Object)">remove</a>, <a href="Map.html#replace(K,V)">replace</a>, <a href="Map.html#replace(K,V,V)">replace</a>, <a href="Map.html#replaceAll(java.util.function.BiFunction)">replaceAll</a></code></div>
<div class="inheritedList">
<h3>Methods declared in interface&nbsp;java.util.<a href="SortedMap.html" title="interface in java.util">SortedMap</a></h3>
<a id="methods.inherited.from.class.java.util.SortedMap">
<!--   -->
</a><code><a href="SortedMap.html#comparator()">comparator</a></code></div>
</section>
</li>


----
喂喂你好

|||
|---|---|
|ceiling | [v, $+\infty$)|
|floor | ($-\infty$, v]|
|lower | ($-\infty$, v)|
|higher | (v, $+\infty$)|