---
layout:     ../../layouts/LayoutBlogPost.astro
title:      Introduction to wireless communication systems(无线通信技术)
# subtitle:   ISAE-SUPAERO(English/中文)
# description: ""
pubDate:       2019-11-30
# author:     TC YU
# header-img: assets/img/CPOOR——JAVA.png
# catalog: true
tags:
    - Signal and System
    - Wireless Communication
categories:
    - Tutorials
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

# Part 1: RF(Radiofrequency)/microwave electronics

## Decibels, gain, and insertion loss

**Digital communication environment**: Guided propagation , "Free space" propagation(including electromagnetic waves which we will learn).  

Flowgraph of a communication system:

[picure:flowgraph_of_system.jpg]

{bi} -> digital communication transmitter -> radio frequency transmitter ~~~> radio frequency receiver -> digital commnication receiver -> {b'i}  

**Examples of RF/microwave systems**

[picture:block_digram_wireless_radio_system.jpg]

FDMA,TDMA,SDMA:Frequency,Time,Space division multiple address

Standard components:

1. Power dividers and combiners/directional couplers
2. Filters
3. Oscillators
4. Amplifiers
5. Mixers
6. Antennas

### Decibels

**Difinition**: dimensionless number that express the radio of two values of a physical quantity, often power or voltage.

Conversion from linear to dB values:
* Power ratio in dB = $10log_{10}(\frac{P_1}{P_2})$
* Voltage ratio in dB = $20log_{10}(\frac{V_1}{V_2})$

Conversion from dB to linear values:
* Power radio = $10^{(\frac{dB}{10})}$
* Voltage radio = $10^{(\frac{dB}{20})}$

也就意味着，同一个dB对应了不同的功率比率和电压比率。

### Gain, insertion loss and return loss

Transmission coefficient in dB:
* if $P_{out} \geq P_{in}$, gain [增加量] G = $10log_{10}(\frac{P_out}{P_in})$ 
* if $P_{out} \leq P_{in}$, insertion loss [减少量] IL = $10log_{10}(\frac{P_in}{P_out})$

**Total gain** $G_T = (G_1 + G_2 + ...) - (IL_1 + IL_2 + ...)$,so $P_{out} = G_T + P_{in}$  

Filter -> IL  
Ampligier -> G  
Attenuator -> IL  

**Notice**: Overall gain in linear : $G_T in linear = \frac{G in linear}{IL in linear}, P_{out} in linear = P_{in} in linear * G_T in linear$

### Decibels as absolute units

P in dBW = $10log_{10}(P in W)$  
P in dBm = $10log_{10}(P in mW)$  

So, **value of dBm = value of dBW + 30** [另外，每当真实值减小一半的时候，dB值减少约3dB]  
2W = 3.010dBW = 2000mW = 33.010dBm  
1W = 0dBW = 1000mW = 30 dBm  
0.001W = -30dBW = 1mW = 0 dBm  

关于Insertion Loss,如果IL= 0,那么损失值为0，也就是说，功率转换率为100%；而如果IL = 3.01,那么转换系数为0.71，功率转换率为50%。


## RF/microwave circuits


### Power dividers/combiners and directional couplers  

* **Poweer dividers/combiners**  

Main characteristics(in its frequency band):
1. Good input and output impedance matching  
2. Low additional insertion loss
3. Good isolation between outputs
4. Constant coupling factors(amplitude and phase)

* **Directional couplers**

input port ; direct port ; coupled port ; isolated or uncoupled port.

Important parameters:
1. Coupling factor
2. Directivity
3. Isolation
4. Insertion loss

Main characteristics(in its frequency band):
1. Good input and output impedance matching
2. Low additional insertion loss
3. High isolation and directivity 高隔离度和方向性
4. Constant coupling(amplitude and phase)


* **Hybrids**

Principle: 3dB directional couplers [定向耦合器] with specific phase difference between the outputs of the through and coupled arms(isolated port terminated with a matched load).  
在直通和耦合的两个方向之间有特定相位差。

### Filters

Purpose:four types of passive devices to control the frequency content of RF/microwave signals.
* Low-pass
* High-pass
* Bandpass
* Bandstop


Main characteristics:
* Good input and output impedance matching in the passbands
* Low insertion loss in the passbands
* *High rejection(attenuation or insertion loss) everwhere else.*

### switches, attenuators[衰减器], phase shifters

purpose: passive or active devices to probide electronic control of the phase and amplitude of RF/microwave signals.

Main characteristics(in its frequency band):
* Good input and output impedance matching
* Lowadditional insertion losss and hiah isolation for switches
* *Large number of values for the attenuation or phase shift*
* *Fast switching speed*


### Oscillators [振荡器]

Purpose: acive devices to provide RF/microwave sources in transmitters and local oscillators in upconverters and downconverters.   
有源器件，可在发射机中提供射频/微波源，并在上变频器和下变频器中提供本地振荡器。


Main characteristics:










### Amplifiers

Purpose: active devices to provide power gain to the input RF/microwave signal.

Different topologies:
* **High Power Amplifiers(HPA)** for transmitters: very high output power but noisy
* **Low Noise Anplifiers(LNA)** for receivers:low output power but less noisy

Typical response:

[picture:response_amplifiers.jpg]


Main characteristics(in its frequency band):
1. Good input and output impedance matching
2. High dynamic
3. High output power for HPA and low noise figure for LNA
4. Good linearity
5. High Power Added Efficiency(PAE): $PAE = \frac{P_{out}-P_{in}}{P_{DC} * 100\%}$

### Mixers


Purpose: Nonlinear devices to achieve frequency conversion

Basic principle:
* Up-conversion(transmitter): mix an intermediate-frequency signal with a local oscillator signal to obtain a high-grequency signal= IF + LO = RF
* Down-conversion(receiver):RF + LO = IF


Main characteristics:
1. Good ...
2. stable LO power
3. Low conversion loss
4. Low noise figure
5. Good isolation between any two of the RF, IF and LO ports
6. Good dynamic range


## RF/microwave antennas

Purpose: passive device to radiate and receive RF/microwave signals(transition between guided and free-space waves)

Time-domain Maxwell equations;

Far-field radiation produced by an antenna:  
properties and average power density.


* **Fundamental parameters**
1. Antenna efficiency e: $e = \frac{P_rad}{P_{in}} = e_re_{rad} \leq 1$
   * $e_r$ Reflection(mismatch) efficiency[反射（不匹配）效率]
   * $e_{rad}$ Radiation(conduction-dielectric) efficiency[辐射（传导介电）效率]
2. Field regions
   * Usual subdivision of the space surrounding an antenna:
     * Rayleigh or reactive near-field region $R_1 = 0.62 \sqrt{\frac{D^3}{\lambda}}$
     * Fresnel or radiating near-field region $R_2 = \frac{2D^2}{\lambda}$
     * Fraunhofer of far-field region
3. Radiation patterns[辐射图]
   * Major(main)lobe
   * Side lobe
   * Side lobe level(SLL)
   * Mian radiation patterns:
     * isotropic antenna
     * directional antenna
     * omnidirectional antenna
4. Radiated power $P_{rad}$: integration of the average power density(the far-field region)
5. Directivity $D(\theta,\phi)$
   * dimensionless and independent of r(in the far-field region)
   * Often expressed in decibels
6. Gain $G(\theta,\phi)$: take into account the efficiency of the antenna  
   高增益天线意味着高方向性的天线。
7. Antenna effective area $A_e(\theta,\phi)$
   * the aperture efficiency
   * to obtain a large gain we need a large antenna relative to the wavelength
8. Antenna noise temperature
   * Background noise temperature TB
   * Brightness temperature Tb
   * Antenna noise temperature


## link budget

### Friis equation in free-space

* Power density radiated by:
  * an isotropic antenna
  * a directive antenna
* EIRP: Equivalent Isotropic Radiated Power $EIRP = P_{in} G_{tmax}$
* SNR at receiving antenna terminals
  * Frequency
  * Distance
  * Characteristics of the transmitter(EIRP) and receiver (G/T)

### System noise

* Noise in RF/microwave receivers:
  * external noise
  * internal noise
    * Thermal noise power

* Equivalent noise temperature

* Noise figure

* Special case

* Noise for a cascaded system




# Part 2 - Principles of digital communications

Digital communications: transmitting elements from a discrete alphabet through a continuous environment.

带通信号，实际上就是一个实窄带高频信号，因为是real，所以傅里叶变换后的频谱共轭对称；
因此分为正频谱和负频谱，我们可以认为正频谱作为分析（解析）信号或者预包络，因为正频谱已经携带了所有该信号的信息。
载频信号往往等于带通信号的信号中心f0，但是也可能不等于；我们在分析带通信号时，可以不考虑载频信号，因为载频信号与数字信息内容无关。
因此，把带通信号去掉载频信号，然后再变成等效低通信号表示，更有利于我们的分析。

我们定义这个低通信号，也就是基带信号，是两倍的正频谱信号，然后把他移到频谱中心位置（向左移f0到低频）；由于我们只是单纯平移，并没有要求该信号在频谱上共轭对称，因此需要对该信号用复数形式表示，也就是有两个正交分量，
分别叫做in-phase signal 和quadrature signal。

带通信号是真实存在的实信号，基带信号是复信号。  
我们需要建立两者之间的表达式。  
首先，对带宽信号进行解释：信号的带宽，是整个非零频谱的一半，所以带通信号的带宽是2B，基带信号的带宽是B。
其次，公式推导（纸质版），可以获得带通信号的三种表示方式。




## Transmission over a carrier frequency

### Real transmission system

* Baseband transmission
* Prqctical IQ transceiver


### Complex equivalent system

* real bandpass signal
* analytic signal
* complex envelope signal

等效低通信号，也称复包络。其频谱等于两倍的向左移f0的解析信号的频谱。进行傅里叶反变换，可以得到其时域信号。

## linear modulations[线性调制]

### Transmission system model

### Amplitude-shift keying(ASK)  


调制解调与希尔伯特变换

调制解调，我们是根据载波信号进行调制。也就是说，等效低通信号对载波频率进行调制再取实部获得带通信号，解调的时候，我们对预包络信号进行解调，得到等效低通信号。










