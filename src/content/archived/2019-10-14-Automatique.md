---
layout:     post
title:      Automatique(自动控制原理)
subtitle:   ISAE-SUPAERO课程
date:       2019-10-14
author:     TC YU
header-img: assets/img/signal_et_system_page.jpg
catalog: true
tags:
    - Automatique
    - 自动控制
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


# 控制系统的校正
**性能指标**
时域指标：超调量，调节时间，上升时间，稳态误差或者开环增益；
频域指标：开环（截止频率，相稳定裕度和模稳定裕度），闭环（峰值比，峰值频率，频带宽度）

**系统校正的设计方法主要有三类：**
1. 频率法;
2. 根轨迹法；
3. 等效结构与等效传递函数法

## Synthèse:approche fréquentielle

### Synthèse de correcteur

串联校正——超前校正，滞后校正，超前-滞后校正；
PID控制；
#### 铺垫
PID、根轨迹、频率法……，搞来搞去都是为了使系统的零极点出现在合适的位置，以满足系统的性能指标。而系统的评价指标为：上升时间，最大超调量和稳定时间等。

**给开环传递函数增加一个零点可以把系统的根轨迹“拉”向左半平面。**

噪声频率高，如果系统的高频增益很大，则意味着添加控制环节后，系统抵抗噪声的能力下降。

当阻尼比ζ一定的情况下，截止频率ωc越大，自然频率ωm也越大，闭环系统的上升时间、峰值时间和调节时间越小，系统的响应速度加快。

相位裕度是穿越频率和无穷频率之间的关系，通过公式推导，可以得出的一个结论是，相位裕度是阻尼比的函数（因为自然频率和截止频率之间的关系系数是阻尼比的方程），在阻尼比小于0.7的情况下，我们认为阻尼比和相位裕度成正比。因此，对于二阶系统，我们可以认为，相位裕度的要求可以控制阻尼比。

带宽频率：当闭环幅频特性下降到频率为零时的分贝值以下3分贝时，对应的频率称为带宽频率。

高阶系统：如存在主导极点，可采用二阶系统的公式；如不存在主导极点，有相应的频域与时域指标的近似公式


_____

***系统校正之用开环频率特性进行系统设计：***  
**（1）稳态特性**———取决于低频，低频增益越大，误差越小。  
要求具有一阶或二阶无静差特性，开环幅频低频斜率应有-20dB或 -40dB。**为保证精度，低频段应有较高增益。**  
**（2）动态特性**———主要取决于中频特性，相位裕度越小，振荡越厉害，截止频率越大，相应速度越快。  
为了有一定稳定裕度，动态过程有较好的平稳性，一般要求开环幅频特性斜率以-20dB穿过零分贝线，且有一定的宽度。**为了提高系统的快速性，应有尽可能大的ωc。**  
**（3）抗干扰性**  
为了提高抗高频干扰的能力，**开环幅频特性高频段应有较大的斜率**。高频段特性是由小时间常数的环节决定的，由于其转折频率远离ωc，所以对系统动态响应影响不大。但从系统的抗干扰能力来看，则需引起重视。


**(1) Correction dérivée:avance de phase**
> améliorer lès marges de stabilité pour une précision donnée en régime permanent.

$C(p) = \frac{1+a \tau p}{1+\tau p}$ avec $a > 1$  
相位超前主要发生在频段$(\frac{1}{a\tau},\frac{1}{\tau})$，而且超前角的最大值为$\varphi_m = arcsin{\frac{a-1}{a+1}}$，对应的角频率为$\omega_m = \frac{1}{\sqrt{a}\tau}$。
**相位超前的作用：超前校正的主要作用是在中频段产生足够大的超前相角，以补偿原系统过大的滞后相角。超前网络的参数应根据相角补偿条件和稳态性能的要求来确定。既能提高快速性，也可以改善振荡性——对于原并不稳定的系统，利用相位超前进行补偿，可以使margin de phase相稳定裕度增加，且设置相位超前的原则是将转折频率分别布置在原截止频率两侧，新的截止频率增大，系统稳定性提高，且更加快速；但是同时，高频段幅频特性的曲线也会上升，也就意味着会使系统抗高频干扰的能力降低。**

<font size = 4>**回顾**：</font>  
原截止频率的含义以及作用：
截止频率（英语：Cutoff frequency）是指一个系统的输出信号能量开始大幅下降（在带阻滤波器中为大幅上升）的边界频率。在波德图中对应的是$\omega_m$，以二阶系统为例，在阻尼不变的情况下，$\omega_m$增加意味着极点位置距离奈奎斯特图的纵轴越远，因此，也就是说，该系统越快速。（为什么呢？）

**示例**  
对于一个二阶积分的开环系统，很明显是一个不稳定系统，在加入相位超前并闭合环路后，通过观察相应开环系统的波德图，可以判断闭环系统稳定；从根轨迹也可以得出类似结论。


**(2) Correction intégrale:retard de phase**
> augmenter la précision tout en conservant de bonnes marges de stabilité.

$C(p) = \frac{1+b \tau p}{1+\tau p}$ avec $b < 1$ ou $C(p) =b \frac{1+ \tau p}{1+b \tau p}$ avec $b > 1$  
**前者的传函只是单纯的相位滞后，而后者也可以理解为包含了gain及增加了放大系数后的传函。因此当才有后者的相位滞后校正的传函，产生的结果是低频的幅频上升、相频下降，而中频和高频的特性基本不变，其稳态精度提高，但是牺牲了快速性（如果没有足够大的放大系数），相稳定裕度降低；截止频率降低。**

在上述定义中，w越靠近低频，振荡越明显，但同时准确度越高，稳态误差越小，而且b的增大对速度反馈误差的减小有明显的作用。

**示例**  


**(3) 超前-滞后相位**  
利用相位超前的校正，可增加频宽提高系统的快速性，并可使稳定裕度加大，改善系统的振荡情况。而滞后校正则可解决提高稳态精度与振荡性的矛盾，但会使频带变窄。**？？？？？？？？？**  

由于相位裕度取决于穿越频率处的相位响应有多么滞后，假如我们想要减小滞后，那么在该区段加一个超前补偿器即可。当然补偿器的幅值响应会影响穿越频率，但是我们总可以调节补偿器中的K使得穿越频率不受影响。当然，高频增益会不可避免的增大。要想尽量避免这一点，只能减小补偿器超前的频率范围，那么带来的相位补偿就相对少了。
而滞后补偿器在（基本上）不影响高频响应的情况下，大幅提高了低频的幅值增益。当然，虽然相位的滞后主要发生在低频段，但是仍旧会在高频段，或者说，在穿越频率处，带来少许的相位滞后，这样子又会进而影响相位裕度。想要减小这个影响，只能减少相位滞后的频率范围，不过带来的低频增益也就随之减少了。


**(4) Correcteur Proportionnel Intégral Dérivée**[PID矫正器]  
在工业自动化设备中，也经常采用由电动或气动单元构成的组合型校正装置，由比例（P）单元$K_p$、微分（D）单元$K_ds$及积分（I）单元$(T_is)^{-1}$可组成PD、PI:及PID三种校正器。

Forme standard: $ C(p)=k_p[1 + \frac{1}{pT_i} + \frac{pT_d}{1+p\frac{T_d}{N}}]$

Dans cette forme standard de la fonction de transfert du correcteur, l’action dérivée est implémentée avec un filtre du premier ordre, dont la constante de temps est N fois plus petite que Td.
=> Atténuation du bruit hautes fréquences, N comprise entre 10 et 20.


积分器，增加一个低频零点，引起超调，但是同时它对准确度（稳态性能）有积极作用，有利于抵抗干扰。

**Structures du PID** 
PID 控制器在BF中的位置分布会影响dépassement de la BF 和 temps de montée；比例和微分会增加其振荡，但是加快其速度，而积分会减小振荡，但影响速度。



## Synthèse:approche modale

### Synthèse modale : placement de pôles 全状态回授
全状态回授（Full state feedback）也称为极点安置（pole placement），是反馈控制系统理论中的一种控制方式，规划受控体的闭回路极点在S平面中事先定义的位置上。在规划控制系统时，会希望可以规划极点的位置，因为极点位置直接对应系统的特征值，而特征值直接影响系统的反应特性。**若要用此方法控制，系统必须有可控制性。**在多输入及多输出的系统中常用此方式控制，例如主动悬架系统。

状态反馈不改变系统的零点，不改变不能控子系统的极点，可任意改变能控子系统的极点（复极点需共轭）用状态反馈进行极点任意配置（复极点需共轭）的充要条件是系统完全能控。

状态反馈不改变系统的能控性，状态反馈可能改变系统的能观性。
说明：状态反馈实现了极点的任意配置，将有可能影响能观性。  
* 产生零极点相消：原来能观系统 -> 不能观系统  
* 消除零极点相消：原来不能观系统 -> 能观系统  
* 静态输出反馈控制u=r+Ky=r+KCx 不会改变系统的能控性与能观性  

> fixer la dynamique du système commandé en imposant les pôles de la boucle fermée.

[picture]

* En mono entrée,K : 1\*n
	* 1 entrée, n états => n ddl(degree de liberte)[自由度];
	> 在统计学中，自由度（英语：degree of freedom, df）是指当以样本的统计量来估计总体的参数时，样本中独立或能自由变化的数据的个数，称为该统计量的自由度。
	* le nombre de pôles placés est égal au nombre de mesures.
	* si p = n, tous les pôles BF sont fixés.
	* si p < n, p pôles sont placés et les n-p autres sont libres.
* En multi entrées, K : m\*n
	* m entrée, n états => m\*n ddl;


Méthode de placement des Pôles:
fixer ou déplacer les valeurs propres d'un système suivant les caractéristique voulues.Et les systèmes sont observable ou commandable.
Les pôles sont les racines du polynôme: $det|pI - A + BK|$.


Régulation et asservissement par retour d'état



























