---
layout:     post
title:      Traitement du signal aléatoire(随机信号处理)
subtitle:   ISAE-SUPAERO课程
date:       2019-10-10
author:     TC YU
header-img: assets/img/signal_et_system_page.jpg
catalog: true
tags:
    - Signal aléatoire
    - 随机信号
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

# Traitement du signal aléatoire 随机信号处理

## 1.Concepts généraux sur les processus et séquences aléatoires

**Notions abordées**

- Définition et exemples
- Spécification statistique : exhaustive et partielle via les moments (fonction moyenne et fonction de corrélation)
- Caractérisation d'un processus ou d'un couple de processus (stationnarité/ergodicité, orthogonalité, indépendance, décorrélation)*[平稳性/遍历，正交性，独立性，去相关]*


**Compétences visées**
 ··
- Identifier les processus aléatoires **(RP)** comme un outil pour la modélisation de signaux non-déterministes*[非确定性信号]*
- Définir mathématiquement ce qu'est un RP
- Donner des exemples de RP pouvant modéliser des signaux non-déterministes
- Définir et utiliser les outils permettant de spécifier statistiquement un RP et un couple de RP
	- de manière exhaustive avec les PDF et CDF à l'ordre n \in\mathbb{N} 
	- de manière partielle avec les moments du premier et second ordre
- Définir et utiliser les outils permettant de caractériser un processus aléatoire comme étant
	- stationnaire au sens strict **(SSS)**  et au sens large **(WSS)** *[严平稳过程和宽平稳过程]*
	- ergodique en moyenne
- Définir et utiliser les outils permettant la caractérisation d'un couple de RP comme étant
	- conjointement WSS
	- indépendants
	- décorrélés
	- orthogonaux
- Identifier la fonction d'autocorrélation **ACF** (et d'intercorrélation **CCF** resp.) comme une mesure de ressemblance
- Calculer et interpréter*[解释]* des ACF et CCF

$(\Omega,T,P )$
$\Omega$[样本空间] espace fondamental(ensemble des événements élémentaire) 
$T$[事件域] mesure des evenements defins sur $\Omega$
$P$[概率] mesure de probabilité ou probabilité aléaroire sur cet espace

![](https://raw.githubusercontent.com/lialittis/lialittis.github.io/master/assets/img/signal%20aleatoire1.png)

```
graph TD
	A[随机现象]  --> B[随机试验]
	B --> C[概率空间]
	C --> D[随机变量]
```

条件概率复习：乘法公式；全概率公式；Bayes公式；
独立：相互独立=>两两独立；
随机变量：将样本空间种各个样本点对应到实数轴上，产生随机变量（分析方式：分布函数或分布律，概率密度，数学特征函数和各阶矩阵）；

### 1.1Fonctions de répqrtition et densité de probabilité[分布函数和概率密度]
(CDF cumulative distribution function)
(PDF probability density function)

**对于一个随机过程**
* 一阶
$F_X(x,t) = P(X(t)\leq x)$
$f_X(x,t) = \frac{\partial F_X}{\partial x}(x,t)$

deux paramètres:x,t.

### 1.2Moments

**1. Moyenne** 

$m_X(t) = E\{X(t)\}$

Lorsaue la moyenne est identiquement nulle, on parle de processus aléatoire centré.

考虑二维变量的独立性对二维变量的数学期望的影响。

条件数学期望，是指在给定X= x的条件下求Y的数学期望，计算积分时从qi概率密度入手。


从数学期望引出矩的概念：
原点矩：数学期望，均方值，互相关
中心矩：方差，协方差

**2. Fonction d'autocorrélation** [自相关系数]

$$R_X(t_1,t_2) = E\{X(t_1)X^*(t_2)\} = \int_{-\infty}^{\infty}\int_{-\infty}^{\infty}x_1x_2^*f_x(x_1,x_2^*t_1,t_2)dx_1dx_2^*$$

当时间相同时，它也表示为在相应时间的puissance
$P_X(t) = R_X(t,t) = E\{|X(t)|^2\}$

**3. Fonction d'autocovariance** 

Autrement dit, la fonction d'autocovariance est définie comme la fonction d'autocorrélation du processus centré.

$C_X(t_1,t_2) = R_X(t_1,t_2) + m_X(t_1)m_X^*(t_2)$

c'est **symétrie hermitienne** pour Cx(t1,t2) et Rx(t1,t2).

**4. Variance d'un processus aléatoire** [方差]

La variance correspond donc à la puissance du processus centré.

$\sigma^2_X(t) = P_X(t) - |m_X(t)|^2$

**5.Coefficient de correlation**

La coefficient de corrélation quantifie le degré de dépendance linéaire entre X(t1) et X(t2);
1 => lineairement dependant, 0 => décorrélé



#### Certaines choses importantes

Pour un exemple Tension délivrée par un oscillateur, la fonction d'autocorrélation ne dépend que de $*tau = t_1-t_2$; la variance du processus est indépendante du temps t.



**6. Pour un couple de processus**

Fonction d'intercorrelation(CCF Cross-correlation function)

Processus orthogonaux
如果两个随机过程的互相关等于零的话，我们可以认为他们是正交过程

Fonction d'intercovariance

Processus décorrélés
不相关的条件是，协方差为零。此时，他们的互相关方程等于两者的期望的共轭乘积。

###1.3 Stationnarité

** 1.Processus stationnaire au sens strict**
(SSS Strict sense stationary random process)严平稳过程
Un processus aléatoire X est stationnaire au sens strict si sa fonction de répartition à l'ordre n est égale à celle du signal aléatoire translaté X(t+T) pour tout T et pour tout $$$ n \geq 1$$$.

* Ordre 1: la moyenne d'un processus stationnaire au sens strict est constante.
* Ordre 2: la fonction d'autocorrélation d'un processus stationnaire au sens strict dépend uniquement de la différence de temps $$$ \tau = t_1 - t_2 $$$. Dans ce cas on peut redéfinir la fonction d'autocorrélation comme une fonction d'un seul paramètre.
# why?

**2. Process stationnaire au sens large ou au second ordre**
(WSS Wide sense stationatry process)宽平稳过程
Un processus stochastique est tationnaire au sens large ou au second ordre si sa moyenne est constante et si sa fonction d'autocorrélation est indépendante de l'origine des temps.

**3. Processus conjointement stationnaires au sens large**

### 1.4 Ergodicité 遍历
Dans tous les cas, la notion d'ergodicité n'a de sens que si l'on suppose le processus au moins stationnaire au sens large.

**1. Moyenne et fonction d'auto-corrélation temporelle**









### Bilan 
1. Comment définit-on un processus aléatoire ?
2. Comment spécifie-t-on statisquement un processus aléatoire
	a. entièrement ?
	b. partiellement ?
3. Comment sont définis les moments à l'ordre 1 et 2
	a. d'une variable aléatoire
	b. d'un processus aléatoire
4. Est-ce que la puissance d'un processus est égale à sa variance ?
5. Quelle est la différence entre la stationnarité au sens strict et la stationnairité au sens large ?
6. QUi implique qui (=>,<=)?
	stationnarité au sens strict	stationnarité au sens large
	stationnatité au second ordre	stationnarité au sens large
	décorrélation					indépendance
7. Relier les caractéristiques d'un (ou deux) processus avec l'outil mathématique qui permet de le définir. Préciser alore son utilisation.
	stationnarité au sens strict	FONCTION D'INTERCORRELATION
	stationnarité qu second ordre	FONCTION D'INTERCOVARIANCE
	orthofonalité	FONCTIONS DE REPARTITION
	décorrélation	MONMENTS A L'ORDRE 1 ET 2
	indépendance
8. Comment mesurer en pratique la moyenne statistique d'un processus aléatoire ergodique par rapport à sa moyenne ?



## 补充：平稳过程
所谓平稳过程粗略地说就是指它是统计特性不随时间推移而变化的随机过程。  
严平稳随机过程：如果随机过程的任意n维随机分布不随时间起点的不同而变化，即取样点在时间轴上平移了任意$\Delta t$之后，其n维概率密度保持不变，则称该随机过程为严平稳或者狭义平稳过程。

要判定某个具体随机信号严平稳是很困难的，它要确定过程的任意有限维分布。因此要引入宽平稳过程。  
* 在很多实际问题中，往往并不需要随机过程在所有时间都平稳，只要在观测的有限时间内过程平稳。  
* 因此，在工程实际的应用中，通常只在相关理论的范围内考察过程的平稳性问题。所谓相关理论是指仅限于研究与随机过程的一、二阶矩有关的理论。主要研究随机过程的数学期望，相关函数及功率谱密度等。  如果随机过程对于每个时间点的均值和方差都存在，则称 为**二阶矩过程**。


## 2.Processus aléatoires stationnaires au sens large

宽平稳过程的条件：若随机过程的数学期望为常数，其相关函数至于时间间隔有关，且均方值有限，即满足三个条件：
1. $E{X(t)} = m_X$  
2. $R_X(t_1，t_2) = R_X(\tau)$  
3. $E{X^2(t)} < \infty$
则称X(t)过程为宽平稳过程，或者广义平稳过程。
 
=>
严平稳过程若均方值有界，则为宽平稳，反之不成立；
高斯过程中，严平稳和宽平稳等价。
#### **？**什么是高斯过程

### 2.1 Propriétés de la fonction de corrélation

WSS: 
1. symétrie hermitienne$\forall\tau,|R_X(\tau)| = R_X^*(-\tau)|$
2. si de plus le processus est réel, sa fonction d'autocorrélation est une fonction paire.
3. la puissance du processus est indépendante du paramètre t.
4. $\forall\tau,|R_X(\tau)|\leq R_X(0)|$
5. $R_X$est une foncion semi-définie positive.

平稳过程不一定是周期性的。  
对于非周期性的，$R_X(\infty) = m_X^*2$  

平稳过程的自相关系数：
$r_X(\tau) = \frac{C_X(\tau)}{\sigma^2_X} = \frac{R_X(\tau) - m_X}{\sigma^2_X}$

随着$\tau$的增大，相关系数下降，当$\tau$增大到一定程度的时候，我们可以认为自相关系数下降到零，即$X(t)$和$X(t+\tau)$不相关。当我们看到$r_X(\tau_0) = 0.05$时，定义这个对应的时间为相关时间。

**Pour un couple de processus**



### 2.2 Densité spectrale de puissance(PSD Power spectral density)

$S_X(f) = F{R_X}(f) = \int_{-\infty}^{+\infty}R_X(\tau)e^{-i2\pi f\tau}d\tau$

**Propriétés:PSD**
1. valeurs dans R
2. $S_X\geq 0$
3. Si X est un processus réel, $S_X$ est une fonction paire.
4. 如果期望不等于0，那么Sx在0处有一个狄拉克函数，poids为期望的平方
5. $P_X = R_X(0) = \int_{-\infty}^{+\infty}S_X(f)df$

**Densité inter-spectrale de puissance**


### 2.3 Processus aléatoires aprés transformation

**Système sans mémoire**
Un système est dit sans mémoire si, pour tout t, la variable aléatoire un sortie Y(t) ne dépend que de la variable aléatoire X(t) et non des variables X(t')
















































