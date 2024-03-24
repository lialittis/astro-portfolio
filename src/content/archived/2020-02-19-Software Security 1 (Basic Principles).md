---
layout:     post
title:      Software Security 1 (Basic Principles)
subtitle:   EPFL课程
date:       2020-02-19
author:     TC YU
header-img: assets/img/header_software_security.jpg
catalog: true
tags:
    - Software Security
    - 软件安全
---

# Software Security 1 (Basic Principles)

**Mathias Payer** EPFL Spring 2020

Allow intended use of software, prevent unintended use that may cause harm.

## Security principles / CIA security triad

* **Confidentiality**: an attacker cannot recover protected data
* **Integrity**: an attacker cannot modify protected data
* **Availability**: an attacker cannot stop/hinder computation

Accountability/non-repudiation may be used as fourth fundamental concept. It prevents denial of message transmission or receipt.

## Attacks and Defenses

* Attack (threat) models
  * A class of attacks that you want to stop
  * What is the attacker’s capability?
  * What is impact of an attack?
  * What attacks are out-of-scope?
* Defenses address a certain attack/threat model
  * General: e.g., stop memory corruptions
  * Very specific: e.g., stop overwriting a return address

### Threat model

The threat model defines the abilities and resources of the attacker. Threat models enable structured reasoning about the attack surface.

* Awareness of entry points (and associated threats)
* Look at systems from an attacker’s perspective
  * Decompose application: identify structure
  * Determine and rank threats
  * Determine counter measures and mitigation

Further reading: https://www.owasp.org/index.php/Application_Threat_Modeling

**Threat model for a safe/lockbox**

You want to protect your valuables by locking them in a safe.

In trust land, you don’t need to lock your safe.
An attacker may pick your lock.
An attacker may use a torch to open your safe.
An attacker may use advanced technology (x-ray) to open it.
An attacker may get access (or copy) your key.


**Threat model: operating systems**

Malicious extension【恶意扩展】: attacker-controlled driver injected in OS;在操作系统中加入攻击者控制的驱动程序\\
Bootkit: compromise the boot process (BIOS, boot sectors)危及boot进程;\\
Memory corruption: software bugs such as spatial and temporal memory safety errors or hardware bugs such as rowhammer;\\
Data leakage【数据泄露】: the OS accidentally returns confidential data
(e.g., randomization secrets);\\
Concurrency bugs【并发问题】: unsynchronized【不同步】 reads across privilege levels result in TOCTTOU (time of check to time of use【检查时间到使用时间】) bugs;\\
Side channels: indirect data leaks through shared resources such as hardware (e.g., caches), speculation (Spectre or Meltdown), or software (page deduplication);\\
Malicious peripherals【恶意外围设备】: an attacker may connect malicious peripherals to an exposed bus;\\
Resource depletion and deadlocks: stop legitimate computation【合法计算】 by exhausting【耗尽】 or blocking【锁死】 access to resources

* **Cost of security**

There is no free lunch, security incurs overhead.
Security is. . .
expensive to develop,
expensive to maintain,
may have performance overhead,
may be inconvenient to users.


* **Fundamental security mechanisms**
  
1. Isolation

Isolate two components from each other. One component cannot access data/code of the other component except through a well-defined API.

2. Least privilege

The principle of least privilege ensures that a component has the least privileges needed to function.

最小特权原则是系统安全中最基本的原则之一。所谓最小特权(Least Privilege)，指的是"在完成某种操作时所赋予网络中每个主体(用户或进程)必不可少的特权"。最小特权原则，则是指"应限定网络中每个主体所必须的最小特权，确保可能的事故、错误、网络部件的篡改等原因造成的损失最小"。

Any further removed privilege reduces functionality
Any added privilege will not increase functionality (according to the specification)
This property constrains an attacker in the obtainable privileges

最小特权原则一方面给予主体"必不可少"的特权，这就保证了所有的主体都能在所赋予的特权之下完成所需要完成的任务或操作;另一方面，它只给予主体"必不可少"的特权，这就限制了每个主体所能进行的操作。
最小特权原则要求每个用户和程序在操作时应当使用尽可能少的特权，而角色允许主体以参与某特定工作所需要的最小特权去签入(Sign)系统。被授权拥有强力角色(Powerful Roles)的主体，不需要动辄运用到其所有的特权，只有在那些特权有实际需求时，主体才去运用它们。如此一来，将可减少由于不注意的错误或是侵入者假装合法主体所造成的损坏发生，限制了事故、错误或攻击带来的危害。它还减少了特权程序之间潜在的相互作用，从而使对特权无意的、没必要的或不适当的使用不太可能发生。这种想法还可以引申到程序内部：只有程序中需要那些特权的最小部分才拥有特权。

3. Fault compartments 【故障舱】

Separate individual components into smallest functional entity possible. These units contain faults to individual components. Allows abstraction and permission checks at boundaries.

Note that this property builds on least privilege and isolation. Both properties are most effective in combination: many small components that are running and interacting with least privileges.


* Example: mail server

**Mail Transfer Agents (MTA)** need to do a plethora of tasks:
> Send/receive data from the network

> Manage a pool of received/unsent messages

> Provide access to stored messages for each user

-> Two approaches: sendmail and qmail

Sendmail uses a typical Unix approach with a large monolithic【庞大的】 server and is known for the high complexity and previous security vulnerabilities【脆弱点】.

QMail uses a modern least privilege approach with a set of
communicating processes.

**QMail** [详见ppt]

> qmail is a mail transfer agent (MTA) that runs on Unix. It was written, starting December 1995, by Daniel J. Bernstein as a more secure replacement for the popular Sendmail program. Originally license-free software, qmail's source code was later dedicated in the public domain by the author.
> When first published, qmail was the first security-aware mail transport agent; since then, other security-aware MTAs have been published. The most popular predecessor to qmail, Sendmail, was not designed with security as a goal, and as a result has been a perennial target for attackers. In contrast to sendmail, qmail has a modular architecture composed of mutually untrusting components; for instance, the SMTP listener component of qmail runs with different credentials from the queue manager or the SMTP sender. qmail was also implemented with a security-aware replacement to the C standard library, and as a result has not been vulnerable to stack and heap overflows, format string attacks, or temporary file race conditions.

Separate modules run under separate user IDs **(isolation)**
Each user ID has only limited access to a subset of the resources **(least privilege)**
Only one very small component runs as suid root
Only one very small component running as root

> SUID (Set owner User ID up on execution) is a special type of file permissions given to a file. Normally in Linux/Unix when a program runs, it inherit’s access permissions from the logged in user. SUID is defined as giving temporary permissions to a user to run a program/file with the permissions of the file owner rather that the user who runs it. In simple words users will get file owner’s permissions as well as owner UID and GID when executing a file/program/command.

4. Trust and correctness

Specific components are assumed to be trusted or correct according to a specification

Formal verification ensures that a component correctly implements a given specification and can therefore be trusted. **Note that this property is an ideal property that cannot generally be achieved.**

## Hardware and software abstractions

### Operating System (OS) abstractions

* Provides process abstraction
* Well-defined API to access hardware resources
* Enforces mutual exclusion to resources
* Enforces access permissions for resources
* Restrictions based on user/group/ACL
* Restricts attacker

OS process isolation:

* Memory protection :protect the memory (code and data such as heap, stack, or globals) of one process from other processes;
* Address space: working memory of one process

Today’s system implement address spaces (virtual memory) through page tables with the help of an Memory Management Unit (MMU)

1. **Single domain OS (Hardware -> Application)**
   1. A single layer, no isolation or compartmentalization
   2. All code runs in the same domain: the application can directly call into operating system drivers
   3. High performance, often used in embedded systems
2. **Monolithic OS(Hardware ->  ->several applications)**
   1. Two layers: the operating system and applications
   2. The OS manages resources and orchestrates access
   3. Applications are unprivileged, must request access from the OS
   4. Linux fully and Windows mostly follows this approach for performance (isolating individual components is expensive)
3. **Micro-kernel**
   1. Many layers: each component is a separate process
   2. Only essential parts are privileged
      1. Process abstraction (address spaces)
      2. Process management (scheduling)
      3. Process communication (IPC)
   3. Applications request access from different OS processes
4. **Library OS**
   1. Few thin layers; flat structure
   2. Micro-kernel exposes bare OS services
   3. Each application brings all necessary OS components




### Hardware abstractions

Virtual memory through MMU/OS

Only OS has access to raw physical memory

DMA for trusted devices

ISA enforces privilege abstraction (ring 0/3 on x86)

Hardware abstractions are fundamental for performance




## Access control

* Authentication【证明】: Who are you (what you know, have, or are)?
* Authorization【授权】: Who has access to object? 
* Audit/Provenance【审查，来源】: I’ll check what you did.

### Authentication
There are three fundamental types of identification:
1. What you know: username / password
2. What you are: biometrics
3. What you have: smartcard / phone

Identification is stronger in combination:
1. two factors are better than one
2. Check for username/password and presence of a security token

### Authorization
—— Information Flow Control (IFC)

Who can access what information?
1. Access policies are called **access control models**.
2. Access control models originally developed by the US military
   * Users with different clearance levels【许可级别】 on a single system
   * Data was shared across different levels of clearance
   * Therefore the name “multi-level security”

—— Types of access control

1. Mandatory Access Control (MAC) 【强制/命令访问控制】
   **Idea: rule and lattice-based policy**\\
   * Centrally controlled
   * One entity controls what permissions are given
   * Users cannot change policy themselves
   > Examples: Bell/LaPadula and Biba\\


**Bell-LaPadula模型 (BLP)** 是一种状态机模型，用于在政府和军事应用中实施访问控制。它是由David Elliott Bell 和Leonard J. LaPadula在Roger R. Schell的指导下设计的，用于规范美国国防部 (DoD) 的多级安全 (MLS) 策略。该模型是计算机安全策略的形式状态转换模型，它利用访问主体和访问对象的安全等级来描述一系列访问控制规则。安全等级的范围从最敏感（如“最高机密”）到最不敏感（如“未分类”或“公开”）。Bell-LaPadula模型是保护与安全之间没有明显区别的模型之一。\\
在存在受信任主体的情况下，Bell-LaPadula模型可能会产生从高机密文档到低机密文档的信息流动。受信任主体不受*属性的限制，但必须证明其在安全策略方面是值得信任的。该安全模型针对访问控制，并被描述为：“下读，上写”。\\
在Bell-LaPadula模型中，用户只能在其自己的安全级别或更高的安全级别上创建内容（如，秘密研究人员可以创建秘密或绝密文件，但不能创建公共文件；不能下写）。相反，用户只能查看在其自己的安全级别或更低的安全级别的内容（如，秘密研究人员可以查看公共或秘密文件，但不能查看绝密文件；不能上读）。\\

Multi level security model that enforces information flow control;\\
All security levels are monotonically ordered;\\
  -> Objects (files) have a clearance level【许可级别】\\
A given clearance allows reading objects of lower or equal clearance and writing files of equal or higher clearance;\\
Summarized as read-down, write-up;\\
Bell/LaPadula enforces confidentiality;\\

注重机密性，此模型强调就是保证机密不能泄密。所以，机密程度越高，越保密，低的就不能读。写方面，高不能往低写，写的话机密的东西流到机密低的地方了。 所以他不允许数据由高级往低级流，但允许低级往高级流，机密性低的数据，跑到机密性高的地方，并不破坏机密性。
比如，1，2，3，4 ， 1级为最高机密，那么2级的人，不可以读1级数据，这将破坏保密原则。所以不能向上读。反之，1级的人，向2级区域写东西，则也会破坏机密性。

If implemented naively, attacker may overwrite confidential files.
Mathias Payer

**Biba模型**

Multi level security model that enforces information flow control;\\
All security levels are monotonically ordered;\\
  Objects (files) have an integrity level【完整性级别】\\
A given clearance allows reading files of higher or equal
clearance and writing files of lower or equal clearance;\\
Biba introduces notion of integrity, separate from secrecy;\\
Summary: read-up, write-down;\\
Biba enforces integrity;\\

完整性1，2，3，4级， 1级是最高完整性，比如是董事会最高决议，它并不需要保密，谁都能看，但任何人不得破坏其完整性，不能修改其决议，只有1级的人才能修改。所以2级的人不可以写1级的内容。但2级可以读1级的内容，来生成2级的信息。 此时，数据只能由高向低流，而禁止从低向高流。

If implemented naively, attacker may leak privileged information.


*另，状态机模型的介绍另见笔记“有限状态机”。*

   
2. Discretionary【任意的，无条件的】 Access Control (DAC) 【自由访问控制】

Idea: object owner specifies policy
* MAC requires central control, empower【许可，准许】 the user!
* User has authority over her resources (introduce ownership)
* User sets permissions for her data if other users want access
* For example: Unix permissions

Can become complex and may require per-file special casing.



3. Role-Based Access Control (RBAC) 【基于角色访问控制】

**Policy defined in terms of roles (sets of permissions), individuals are assigned roles, roles are authorized for tasks.**

* Access permission is broken into sets of roles.
* Users get assigned specific roles
* Administration privileges may be a role.

Roles simplify special casing but roles can become overly complex.



## Access control matrix 

map access rights for subjects to objects


|  | foo | bar | baz |
|:------:|:-------:|:------:|:-------:|
| user | rwx | rw | rw |
| group | rx | r | r |
| other | rx |   | r | 

Used, e.g., for Unix/Linux file systems or Android/iOS/Java security model for privileged APIs.

Introduced by Butler Lampson in 1971
http://research.microsoft.com/enus/um/people/blampson/08-Protection/Acrobat.pdf

## Summary

* Software security goal: allow intended use of software, prevent
unintended use that may cause harm.
* Security triad, core principles: Confidentiality, Integrity, Availability.
* Security of a system depends on its threat model.
* Concepts: isolation, least privilege, fault compartments, trust.
* Security relies on abstractions to reduce complexity.
* Reading assignment: Butler Lampson, Protection 
  http://doi.acm.org/10.1145/775265.775268

