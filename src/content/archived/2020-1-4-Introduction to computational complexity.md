---
layout:     post
title:      Introduction to computational complexity
subtitle:   ISAE-SUPAERO课程
date:       2020-1-4
author:     TC YU
header-img: img/signal_et_system_page.jpg
catalog: true
tags:
    - Informatique
---
<head>
    <script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>
    <script type="text/x-mathjax-config">
        MathJax.Hub.Config({
            tex2jax: {
            skipTags: ['script', 'noscript', 'style', 'textarea', 'pre'],
            inlineMath: [['$','$']]
            }
        });
    </script>
</head>

# Introduction to combinatorail optimization

## Some examples:
1. Connecting equipments --> minimize the total connections cost
[picture:connecting_equipments.jpg]
weighted graphs

2. Take-offs planning --> minize the maximal delay on the set of planes

HARD. Scheduling tasks with length and earliest starting time with minimising the maximal delay is a difficult problem(Travelling Salesman Problem)

行商问题（最短路径问题）（英语：travelling salesman problem, TSP）是这样一个问题：给定一系列城市和每对城市之间的距离，求解访问每一座城市一次并回到起始城市的最短回路。它是组合优化中的一个NP困难问题，在运筹学和理论计算机科学中非常重要。

3. Project management --> Prgqnize tqsks in time in order to minimize the project total length


## Some common features

1. a search space *S*: the possible alternatives
2. the search space is represented by a set of variables $V = \{ v_i : i \in \{ 1,...,n\}\}$,each variable $v_i$ having a domain $D_i$
3. a set $C_o$ of constraints to be satisfied
   * constraints are assertions[约束是确定的，不可改变的]
   * they may represent physical(real-world)limitations or user prerequisites[它们可能代表了实际的物理含义或者某些先决条件]
   * a solution is an alternative that satisfies all constraints in $C_o$
4. a set $C_r$ of criteria to be satisfied as best
   * a criterion is a function from *S* to a totally ordered set(R+ for instance). This function has to be minimized or maximized
   * they represent user preferences


## More examples

1. The knapsack problem: 
* a set O of objects to put in the knapsack
* a dimension D to be considered(weight for instance)
* maximal capacity C w.r.t the dimension for the knapsack
* for each object o a consumption D0
* for each object o, its value V0 reflects its importance
Objective: to maximize the sum of values of the chosen objects while respecting the capacity of the knapsack

Model the knapsack problem  --> 

$$

**variables** \forall o \in O, P_o \in \{0,1\} -----\{faux,vrai\}
**containte** \sum_{o\in O} D_oP_o \leq C
**criteria** Maximize \sum_o\in O V_oP_o

$$

2. The Traveling Salesman Problem

**Input**\\
* a set of towns to be visited by a salesman
* the distances between the towns
**Objective**\\
Find a circui tith minimal length visiting each town exactly one time (hamiltonian circuit).


If you have n towns, the size of the space search is (n-1)!

**SO, are TSP solution enumerable ?**

**OPtimistic hypothesis**: 10e-12s to compute and ecaluate a path
number of towns   --   computation times(s)
10                --   3.63e-6
15                --   1.31
20                --   2432902 $\approx 0.77year$
30                --   265252859812191058636

$265252859812191058636 s \approx 84111130077 millenia = more than 500 times the age of the Universe !$

It's a combinatorial explosion.[组合爆炸，组合展开]

**How to deal with combinatorial explosion ?**

The Challenge is: Produce optimal or approached solution without exploring the complete search space.

1. Dedicated algorithms: efficient, but costly.[专用算法，高效但费用高]
2. Use/adapt existing algorithms and tools.[利用已存在的算法和工具]
3. Use a **generic modelling framework**, with **generic resolution algorithms**.[通用建模框架，通用解决算法]

[picture:some_modelling_framework_and_resolution_methods.jpg]

# Complexity Theory

## Motivation

Observation from previous examples:\\
* some algorithms seen to be more efficient than others
* for a given problem, some instances seem to be more difficult to solve than others
* some problems seem to be more difficult than others

**Objecitve**\\
* **build a theory that explains and predicts such phenomena**
* **the theory must be independent from the languages compilers or machines that are used**

## Algorithms and problems

* **Problem**: a set of instances with the same structure on which you ask a question
* **Instance**: a problem with data
* **Algorithms**: a procedure taking an instance as input and answering the question of the problem as output

## Another important example:SAT

The SAT (for satisfiability) problem is an important problem for complexity theory.

**Definition(clause)**\\

Let $\{x_1,...,x_n\}$ be a set of boolean variables (i.e. $D_{xi} = \{true,false\}$)
* literal[断言，说明]: a variable $x_i$ or the negation of a variable($\neg x_i$)
* clause[从句，条款]: a disjunction[分离] of literals, e.g. $x_i \vee \neg x_4 \vee x_5$


-- >

* **Problem**: given a finite set of clauses, is the set satisfiable(i.e. can you assign variables to make all the clauses true)?
* **Instance**: is $\{x1 \vee \neg x_4 \vee x_5, \neg x_1 \vee \neg x_5$ satisfiable ?
* **Algorithms**: models enumeration, resolution algorithm, DPLL procedure, etc..





