B.7 Statistics B.7 统计数据
Collecting data about the runtime behavior of the system can provide a substantial amount of insight into its behavior and opportunities for improving its performance. For example, we might want to track the average number of primitive intersection tests performed for all the rays; if this number is surprisingly high, then there may be a latent bug somewhere in the system. pbrt’s statistics system makes it possible to measure and aggregate this sort of data in a variety of ways. The statistics system is only available with the CPU renderer; an exercise at the end of this appendix discusses how it might be brought to the GPU.
收集有关系统运行时行为的数据可以帮助我们深入了解系统的行为，并为提高系统性能提供机会。例如，我们可能希望跟踪所有射线执行的原始交集测试的平均次数；如果这个数字出奇地高，那么系统中的某个地方可能存在潜在的错误。 pbrt 的统计系统可以通过多种方式测量和汇总此类数据。统计系统仅适用于 CPU 渲染器；本附录末尾的练习将讨论如何将其引入 GPU。

It is important to make it as easy as possible to add new measurements to track the system’s runtime behavior; the easier it is to do this, the more measurements end up being added to the system, and the more likely that “interesting” data will be discovered, leading to new insights and improvements. Therefore, it is fairly easy to add new measurements to pbrt. For example, the following lines declare two counters that can be used to record how many times the corresponding events happen.
重要的是，要尽可能方便地添加新的测量来跟踪系统的运行时行为；越容易做到这一点，最终就会有越多的测量被添加到系统中，也就越有可能发现 "有趣 "的数据，从而获得新的见解和改进。因此，在 pbrt 中添加新的测量非常容易。例如，以下几行声明了两个计数器，可用于记录相应事件发生的次数。

STAT_COUNTER("Integrator/Regular ray intersection tests", nIsectTests);
STAT_COUNTER("Integrator/Shadow ray intersection tests", nShadowTests);
STAT_COUNTER（"积分器/常规射线交点测试"，nIsectTests）；
STAT_COUNTER（"Integrator/Shadow ray intersection tests"，nShadowTests）；
As appropriate, counters can be incremented with simple statements like
在适当的情况下，计数器可以通过简单的语句递增，例如

  ++nIsectTests; ++nIsectTests；
With no further intervention from the developer, the preceding is enough for the statistics system to be able to automatically print out nicely formatted results like the following when rendering completes:
不需要开发人员的进一步干预，前面的内容就足以让统计系统在渲染完成后自动打印出如下格式的结果：

  Integrator
    Regular ray intersection tests                752982
    Shadow ray intersection tests                4237165
集成商
    常规射线交叉测试 752982
    阴影射线交叉测试 4237165
The statistics system supports the following aggregate measurements:
统计系统支持以下综合测量：

STAT_COUNTER("name", var): A count of the number of instances of an event. The counter variable var can be updated as if it was a regular integer variable; for example, ++var and var += 10 are both valid.
STAT_COUNTER("name", var) ：事件实例数的计数。计数变量 var 可以像普通整数变量一样更新；例如， ++var 和 var += 10 都有效。
STAT_MEMORY_COUNTER("name", var): A specialized counter for recording memory usage. In particular, the values reported at the end of rendering are in terms of kilobytes, megabytes, or gigabytes, as appropriate. The counter is updated the same way as a regular counter: var += count * sizeof(MyStruct) and so forth.
STAT_MEMORY_COUNTER("name", var) ：记录内存使用情况的专用计数器。具体而言，渲染结束时报告的值将根据情况以千字节、兆字节或千兆字节为单位。计数器的更新方式与普通计数器相同： var += count * sizeof(MyStruct) 等等。
STAT_INT_DISTRIBUTION("name", dist): Tracks the distribution of some value; at the end of rendering, the minimum, maximum, and average of the supplied values are reported. Call dist << value to include value in the distribution.
STAT_INT_DISTRIBUTION("name", dist) ：跟踪某些值的分布；在渲染结束时，报告所提供值的最小值、最大值和平均值。调用 dist << value 可将 value 包括在分布中。
STAT_PERCENT("name", num, denom): Tracks how often a given event happens; the aggregate value is reported as the percentage num/denom when statistics are printed. Both num and denom can be incremented as if they were integers—for example, one might write if (event) ++num; or ++denom.
STAT_PERCENT("name", num, denom) ：跟踪给定事件发生的频率；打印统计数据时，汇总值以百分比 num/denom 的形式报告。 num 和 denom 都可以像整数一样递增，例如，可以写成 if (event) ++num; 或 ++denom 。
STAT_RATIO("name", num, denom): This tracks how often an event happens but reports the result as a ratio num/denom rather than a percentage. This is often a more useful presentation if num is often greater than denom. (For example, we might record the percentage of ray–triangle intersection tests that resulted in an intersection but the ratio of triangle intersection tests to the total number of rays traced.)
STAT_RATIO("name", num, denom) ：跟踪事件发生的频率，但以比率 num/denom 而不是百分比来报告结果。如果 num 经常大于 denom ，那么这种显示方式通常更有用。(例如，我们可以记录光线-三角形交点测试中产生交点的百分比，但不记录三角形交点测试占光线追踪总次数的比率）。

Figure B.8: Visualization of Average Path Length at Each Pixel. Each pixel’s value is based on the number of rays traced to compute the pixel’s shaded value. Not only it is evident that longer paths are traced at pixels with specular surfaces like the glasses on the tables, but it is also possible to see the effect of Russian roulette terminating paths more quickly at darker surfaces. This image was generated using STAT_PIXEL_COUNTER and only required adding two lines of code to an integrator. (Scene courtesy of Guillermo M. Leal Llaguno.)
图 B.8：每个像素的平均路径长度可视化。 每个像素的值都是基于为计算该像素的阴影值而追踪的光线数量。不仅可以明显看出，在具有镜面（如桌子上的玻璃杯）的像素上追踪的路径更长，而且还可以看到俄罗斯轮盘赌的效果，即在较暗的表面上更快地终止路径。此图像使用 STAT_PIXEL_COUNTER 生成，只需在积分器中添加两行代码即可。（场景由 Guillermo M. Leal Llaguno 提供。
In addition to statistics that are aggregated over the entire rendering, pbrt can also measure statistics at each pixel and generate images with their values. Two variants are supported: STAT_PIXEL_COUNTER and STAT_PIXEL_RATIO, which are used in the same way as the corresponding aggregate statistics. Per-pixel statistics are only measured if the –pixelstats command line option is provided to pbrt. Figure B.8 shows an image generated using STAT_PIXEL_COUNTER.
除了汇总整个呈现的统计数据外， pbrt 还可以测量每个像素的统计数据，并生成包含其值的图像。支持两种变体： STAT_PIXEL_COUNTER 和 STAT_PIXEL_RATIO ，其使用方式与相应的汇总统计数据相同。只有为 pbrt 提供 –pixelstats 命令行选项时，才能测量每个像素的统计数据。图 B.8 显示了使用 STAT_PIXEL_COUNTER 生成的图像。

All the macros to define statistics trackers can only be used at file scope and should only be used in *.cpp files (for reasons that will become apparent as we dig into their implementations). They specifically should not be used in header files or function or class definitions.
所有用于定义统计跟踪器的宏只能在文件范围内使用，并且只能在 *.cpp 文件中使用（原因将在我们深入研究其实现后逐渐显现）。它们尤其不能在头文件、函数或类定义中使用。

Note also that the string names provided for each measurement should be of the form “category/statistic.” When values are reported, everything under the same category is reported together (as in the preceding example).
还要注意的是，为每项测量提供的字符串名称应为 "类别/统计量 "形式。在报告数值时，同一类别下的所有内容都会一起报告（如前面的示例）。

B.7.1 Implementation B.7.1 实施
There are a number of challenges in making the statistics system both efficient and easy to use. The efficiency challenges stem from pbrt being multi-threaded: if there was not any parallelism, we could associate regular integer or floating-point variables with each measurement and just update them like regular variables. In the presence of multiple concurrent threads of execution, however, we need to ensure that two threads do not try to modify these variables at the same time (recall the discussion of mutual exclusion in Section B.6.1).
要使统计系统既高效又易于使用，我们面临着许多挑战。效率方面的挑战源于 pbrt 的多线程性：如果没有并行性，我们可以将常规整数或浮点变量与每个测量值关联起来，然后像常规变量一样更新它们。但是，在存在多个并发执行线程的情况下，我们需要确保两个线程不会同时尝试修改这些变量（回顾第 B.6.1 节中关于互斥的讨论）。

While atomic operations like those described in Section B.6.1 could be used to safely increment counters without using a mutex, there would still be a performance impact from multiple threads modifying the same location in memory. Recall from Section B.6.3 that the cache coherence protocols can introduce substantial overhead in this case. Because the statistics measurements are updated so frequently during the course of rendering, we found that an atomics-based implementation caused the renderer to be 10–15% slower than the following implementation, which avoids the overhead of multiple threads frequently modifying the same memory location.
虽然第 B.6.1 节中描述的原子操作可用于在不使用互斥的情况下安全地递增计数器，但多个线程修改内存中的同一位置仍会影响性能。回顾B.6.3节，在这种情况下，高速缓存一致性协议可能会引入大量开销。由于统计测量值在渲染过程中更新非常频繁，我们发现基于原子的实现会导致渲染器的速度比下面的实现慢 10-15%，而下面的实现可以避免多个线程频繁修改同一内存位置所带来的开销。

The implementation here is based on having separate counters for each running thread, allowing the counters to be updated without atomics and without cache coherence overhead (since each thread increments its own counters). This approach means that in order to report statistics, it is necessary to merge all of these per-thread counters into final aggregate values, which we will see is possible with a bit of trickiness.
这里的实现方法是为每个运行线程设置独立的计数器，这样计数器的更新就无需原子化，也不会产生缓存一致性开销（因为每个线程都会递增自己的计数器）。这种方法意味着，为了报告统计数据，有必要将所有这些每线程计数器合并为最终汇总值。

To see how this all works, we will dig into the implementation for regular counters; the other types of measurements are all along similar lines. First, here is the STAT_COUNTER macro, which packs three different things into its definition.
为了了解这一切是如何工作的，我们将深入探讨常规计数器的实现；其他类型的测量都遵循类似的思路。首先，这里是 STAT_COUNTER 宏，它的定义包含三个不同的内容。

<<Statistics Macros>>= 
<<统计宏>>=
#define STAT_COUNTER(title, var)                                       \
    static thread_local int64_t var;                                   \
    static StatRegisterer STATS_REG##var([](StatsAccumulator &accum) { \
        accum.ReportCounter(title, var);                               \
        var = 0;                                                       \
    });
#define STAT_COUNTER(title, var) （定义
    static thread_local int64_t var;\
    static StatRegisterer STATS_REG##var([](StatsAccumulator &accum) { \
        accum.ReportCounter(title, var);\
        var = 0; \
    });
First, and most obviously, the macro defines a 64-bit integer variable named var, the second argument passed to the macro. The variable definition has the thread_local qualifier, which indicates that there should be a separate copy of the variable for each executing thread. This variable can then be incremented directly as appropriate to report results. However, given these per-thread instances, we need to be able to sum together the per-thread values and to aggregate all the individual counters into the final program output.
首先，也是最明显的一点是，宏定义了一个名为 var 的 64 位整数变量，它是传递给宏的第二个参数。该变量定义使用了 thread_local 限定符，表示每个执行线程都应该有一个单独的变量副本。然后，可以根据需要直接递增该变量，以报告结果。不过，考虑到这些每个线程的实例，我们需要能够将每个线程的值相加，并将所有单个计数器汇总到最终的程序输出中。

To this end, the macro next defines a static variable of type StatRegisterer, giving it a (we hope!) unique name derived from var. A lambda function is passed to the StatRegisterer constructor, which stores a copy of it. When called, the lambda passes the current thread’s counter value to a ReportCounter() method and then resets the counter. Evidently, all that is required is for this lambda to be called by each thread and for ReportCounter() to sum up the values provided and then report them. (We will gloss over the implementation of the StatsAccumulator class and methods like ReportCounter(), as there is nothing very interesting about them.)
为此，宏接下来定义了一个类型为 StatRegisterer 的静态变量，并赋予它一个源自 var 的唯一名称（我们希望！）。一个 lambda 函数被传递给 StatRegisterer 构造函数，该构造函数存储了它的副本。调用时，lambda 会将当前线程的计数器值传递给 ReportCounter() 方法，然后重置计数器。显然，只需每个线程调用该 lambda，然后 ReportCounter() 将提供的值汇总并报告即可。(我们将略过 StatsAccumulator 类和 ReportCounter() 等方法的实现，因为它们并不十分有趣）。

Recall that in C++, constructors of global static objects run when program execution starts; thus, each static instance of the StatRegisterer class runs its constructor before main() starts running. This constructor, which is not included here, adds the lambda passed to it to a std::vector that holds all such lambdas for all the statistics.
回想一下，在 C++ 中，全局 static 对象的构造函数会在程序开始执行时运行；因此，在 main() 开始运行之前， StatRegisterer 类的每个 static 实例都会运行其构造函数。这里不包括该构造函数，它将传递给它的 lambdas 添加到一个 std::vector 中，该 std::vector 保存了所有统计数据的所有此类 lambdas。

At the end of rendering, the ForEachThread() function is used to cause each thread to loop over the registered lambdas and call each of them. In turn, the StatsAccumulator will have all the aggregate values when they are done. The PrintStats() function can then be called to print all the statistics that have been accumulated in StatsAccumulator.
在呈现结束时， 函数将用于使每个线程循环访问已注册的 lambdas，并调用其中的每一个。反过来， StatsAccumulator 在完成后将拥有所有的聚合值。然后，可以调用 PrintStats() 函数来打印 StatsAccumulator 中积累的所有统计数据。