---
layout:     post
title:      Signature Algorithm 数字签名算法
subtitle:   Ecole Polytechnique
date:       2020-11-16
author:     TC YU
header-img: assets/img/Crypto_title.png
catalog: true
tags:
    - Cryptography
    - 密码学
    - Signature Algorithm
---


# Signature algorithm


## Definitions and properties

### Definitions

**Required properties for a signature**

* authentic
* unforgeable
* cannot be reused
* immutable

**In the asymmetric world**

* non repudiation
* verifiable

### Properties

![signature & verification]()

Choosing a system:

* signing must be easy for the legitimate user (trapdoor)【合法用户】 and impossible for anybody else;
* verification can be done easily.

Duality with ((E,$k_e$),(D,$k_d$)) in asymmetric encryption.

### Security issues

* Types of forgery
  * total break
  * selective forgery
  * existential forgery

* Types of attacks
  * key-only
  * message attacks
    * known_message attack
    * chosen-message attack
    * adaptive chosen-message attack

## Signatures in the asymmetric world

### **A. Signature with appendix**

*Prerequisite*: each user has a pair (S, V) where S is the private signature algorithm, V the public verification algorithm, s.t. V(m, S(m)) =true.

*Signature*: Alice signs m and sends (m, $S_A$(m)).

*Verification*: Bob gets an authenticated copy of Alice’s $V_A$ and
tests whether $V_A$(m,s) ==true.

Rem.
* m is necessary for the verification
* if m is too long, one uses $S(m) = S'(\mathcal{H}(m))$

Ex.(typical) Alice has an RSA key $(N_A,e_A,d_A)$; $S_A(m) = m^{d_A} mod N_A$; $V_A(m,s) = (s^{e_A} mod N_A == m)$.

**But**:(E(x),x) is a valid pair => one must not sign everything; a MAC can be added. ????????????

### **B. Schemes with message recovery**

Idea: S(m) yields m, which increases the bandwidth.

Ex. (toy) $S_A$(m) = m^{dA} mod $N_A$, $V_A$(s) = s^{$e_A$} mod $N_A$; 
if E(D(m)) = m, one takes S = D, V = E.

But, since x is a signature on E(x) (due to V(x) = E(x)); => one must be able to recognize a genuine message, i.e., formatted using a redundancy function R.

Ex. R(m) = m||m: a random m' possesses the good redundancy with proba $2^{-n}$.

* Signature: Alice computes m' = R(m) and sends s = S_A(m')
* Verification : Bob gets the authenticate verification algorithm of Alice; Bob computes m'' = V_A(s) and checks that m'' show the required redundancy: if yes, he gets back m as $R^{-1}(m'')$;otherwise, the signature is rejected.

## Signing with RSA

### with appendix

First idea: TEXTBOOK-RSA, but possible attacks using the malleability property.

Second idea: $S(m) = \mathcal{H}(m)^d mod N$ with $\mathcal{H} = MD5$; $V(m,s) = ((s^e mod N) == \mathcal{H}(m))$

Desmedt-Odlyzko; Coron-Naccache-Stern 【待补充】


* **PSS**

Probabilistic signature scheme (Bellare Rogaway) with security proof

Prerequisite: 

* **with message recovery**

simple idea: $R(m) = mw = m||0...0; k = log2N + 1 ; t<k/2, w = 2^t and 0 \leq m < N/w -1$

## ElGamal and variants




## SignCrypt



## 中文部分注解

1. 签名具有不可伪造性，签名者可以用它很好地证明自己的身份。同时，前面的另一个重要的功能就是，它可以使被签名的文件局游法律效应，签名者无法否认自己签过的文件。——“抗抵赖性”
2. 带有附录的签名方式，是指原信息也作为签名算法的输出的一部分，签名作为整个输出信息的附录而存在的，因此验证算法中需要原信息和签名一同作为输入。这种签名算法与信息恢复（message recovery）签名算法相反，后者往往在签名中嵌入信息，当所有的信息都被嵌入时，验证程序只需要将签名作为输入，然后将信息恢复（类似与副产品一样）。
3. **ElGamal加密算法** : ElGamal加密算法是一个基于迪菲-赫尔曼密钥交换的非对称加密算法。它在1985年由塔希尔·盖莫尔提出。GnuPG和PGP等很多密码学系统中都应用到了ElGamal算法。ElGamal加密算法可以定义在任何循环群G上。它的安全性取决于G上的离散对数难题。ElGamal加密算法由三部分组成：密钥生成、加密和解密。

A. 密钥生成

密钥生成的步骤如下：

* Alice利用生成元g产生一个q\,阶循环群G\,的有效描述。该循环群需要满足一定的安全性质。
* Alice从$\displaystyle \{1,\ldots ,q-1\}$中随机选择一个x。
* Alice计算${\displaystyle h:=g^{x}}$。
* Alice公开h\,以及{\displaystyle G,q,g\,}的描述作为其公钥，并保留x作为其私钥。私钥必须保密。


加密

使用Alice的公钥{\displaystyle (G,q,g,h)}向她加密一条消息m的加密算法工作方式如下：
* Bob从${\displaystyle \{1,\ldots ,q-1\}}$随机选择一个y，然后计算${\displaystyle c_{1}:=g^{y}}$。
* Bob计算共享秘密{\displaystyle s:=h^{y}}。
* Bob把他要发送的秘密消息m映射为G上的一个元素{\displaystyle m'}。
* Bob计算{\displaystyle c_{2}:=m'\cdot s}。
* Bob将密文{\displaystyle (c_{1},c_{2})=(g^{y},m'\cdot h^{y})=(g^{y},m'\cdot (g^{x})^{y})}发送给Alice。
值得注意的是，如果一个人知道了{\displaystyle m'}，那么它很容易就能知道{\displaystyle h^{y}}的值。因此对每一条信息都产生一个新的y可以提高安全性。所以y也被称作临时密钥（英语：ephemeral key）。

解密
利用私钥x对密文{\displaystyle (c_{1},c_{2})}进行解密的算法工作方式如下：

Alice计算共享秘密{\displaystyle s:=c_{1}{}^{x}}
然后计算{\displaystyle m':=c_{2}\cdot s^{-1}}，并将其映射回明文m，其中{\displaystyle s^{-1}}是s在群G上的逆元。（例如：如果G是整数模n乘法群的一个子群，那么逆元就是模逆元）。
解密算法是能够正确解密出明文的，因为
{\displaystyle c_{2}\cdot s^{-1}=m'\cdot h^{y}\cdot (g^{xy})^{-1}=m'\cdot g^{xy}\cdot g^{-xy}=m'.}
实际使用
ElGamal加密系统通常应用在混合加密系统（英语：hybrid cryptosystem）中。例如：用对称加密体制来加密消息，然后利用ElGamal加密算法传递密钥。这是因为在同等安全等级下，ElGamal加密算法作为一种非对称密码学系统，通常比对称加密体制要慢。对称加密算法的密钥和要传递的消息相比通常要短得多，所以相比之下使用ElGamal加密密钥然后用对称加密来加密任意长度的消息，这样要更快一些。


4. Diffie-Hellman

Diffie-Hellman 密钥交换
