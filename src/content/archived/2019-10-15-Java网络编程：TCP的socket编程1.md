---
layout:     post
title:      Java网络编程：TCP的socket编程1
subtitle:   ISAE-SUPAERO课程
date:       2019-10-15
author:     TC YU
header-img: assets/img/CPOOR——JAVA.png
catalog: true
tags:
    - Java
    - 计算机网络
---

# Java网络编程

## protocoles et échanges de messages 协议和信息交换

Cette séance permet d'appliquer une partie des notions : les hôtes, les processus, les protocoles de communication, les adresses IP, les ports, les protocoles standard TCP et UDP, les sockets Java, la connexion et l'envoi et la réception de messages.

Plus précisément, l'échange de messages se fera avec l'API Socket de Java (paquetage standard java.net), et l'exploitation des messages se fera avec l'API I/O de Java (paquetage standard java.io déjà utilisé pour exploiter les fichiers). Vous manipulerez surtout le protocole TCP et des messages textuels, mais vous aurez aussi l'occasion d'utiliser le protocole UDP et d'exploiter des messages au format binaire (types primitifs et objets), toujours avec l'API I/O de Java.

**网络编程**是指编写运行在多个设备（计算机）的程序，这些设备都通过网络连接起来。
**协议**相当于相互通信的程序间达成的一种约定，它规定了分组报文的结构、交换方式、包含的意义以及怎样对报文所包含的信息进行解析，TCP/IP协议族有IP协议、TCP协议和UDP协议。**现在TCP/IP协议族中的主要socket类型为流套接字（使用TCP协议）和数据报套接字（使用UDP协议）**。

### Connecter des processus avec TCP

TCP协议提供面向连接的服务，通过它建立的是可靠地连接。

Quand deux processus communiquent avec TCP, ils sont généralement exécutés sur deux hôtes différents, et chaque hôte peut héberger plusieurs processus supplémentaires. L'illustration suivante montre 6 processus répartis sur 3 hôtes.


![](https://raw.githubusercontent.com/lialittis/lialittis.github.io/master/assets/img/java_processus.PNG)



L'adressage permet à un processus X sur un hôte H1 d'envoyer des messages à un processus Y sur un hôte H2 avec TCP. L'adressage comporte alors :
* **Une adresse IP** pour identifier sur le réseau l'hôte H2 qui héberge le processus destinataire.
* **Un numéro de port** pour identifier Y parmi tous les processus qui s'exécutent sur H2.

Une connexion TCP est asymétrique : l'un des processus attend la connexion, et l'autre processus établit la connexion :
* Le processus qui attend la connexion TCP est appelé **serveur** ; il doit être configuré avec **un numéro de port** où il accepte des connexions TCP.
* Le processus qui établit la connexion TCP est appelé **client** ; il doit être configuré avec **l'adresse IP et le numéro de port du serveur**.

![](https://raw.githubusercontent.com/lialittis/lialittis.github.io/master/assets/img/java_IP_portes.PNG)

### Les adresses IP d'un hôte

Les différents équipement réseau intégrés à un hôte sont appelés des **interfaces réseau**[网络接口].

Un hôte comprend en général plusieurs adresses IP, dont une par interface réseau active :

* Une adresse de loopback permettant des communications locales rapides[本地快速回环系统], entre processus s'exécutant sur l'hôte : **127.0.0.1**;
* Une adresse IP pour chaque interface Ethernet (prise Ethernet[以太网插口]). 
* Une adresse IP pour l'interface Wi-Fi. 
* Etc. (Bluetooth, GSM...)

On utilise fréquemment des noms au lieu d'utiliser des adresses IP. Et le protocole standard DNS permet de faire la correspondance entre les noms d'hôtes et les adresses IP.
[使用替代名称]
因此可能会存在主机上运行的不同进程之间的本地调用的标准名称，`localhost`，和用于主机之间的以太网接口的IP地址。

### Couches protocolaires
Le système d'exploitation d'un hôte comprend des couches protocolaires qui traitent les messages arrivant ou partant sur une de ses interfaces réseau. Parmi ces couches protocolaires, on trouve en particulier :

* La couche liaison de données, qui fait le lien entre chaque interface réseau et la couche IP.
* La couche IP, qui traite tous les messages IP entrants ou sortants pour tous les processus s'exécutant sur l'hôte.
* La couche TCP, qui traite tous les messages TCP entrants ou sortants via la couche IP.

![](https://raw.githubusercontent.com/lialittis/lialittis.github.io/master/assets/img/java_couches_procolaires.PNG)
### Numéros de port TCP
Quand un message TCP arrive sur un hôte, le numéro de port permet à la couche TCP de l'envoyer au processus destinataire.

démultiplexage et multiplexage


![](https://raw.githubusercontent.com/lialittis/lialittis.github.io/master/assets/img/java_multiplexage.PNG)

> ***Valeurs de port autorisées***  
> Les processus exécutés par un utilisateur, par exemple vos futurs exercices, doivent utiliser un numéro de port **supérieur ou égal à 1024.**  
> Les processus exécutés par un **super-utilisateur** peuvent utiliser les autres numéros de port.Les hôtes du CI sont tous protégés par leur propre firewall, qui bloque la plupart de ces ports utilisateurs.   
> Actuellement, seul le port **** est autorisé pour les connexions de clients situés sur d'autres hôtes. La liste des ports ouverts est déterminée par le SI en fonction de sa politique de sécurité globale.(pour ISAE-SUPAERO)  
> Les principaux services standard ont des numéros de port TCP prédéfinis :  
> * 80 pour HTTP, le protocole du Web  
> * 443 pour HTTPS, la version sécurisée de HTTP  
> * 22 pour SSH  
> * etc. (chercher port standard IMAP ou SMTP par exemple)

### **Connecter deux applications Java avec TCP**

Le JDK propose deux classes standard pour connecter deux applications Java avec TCP :

La classe java.net.ServerSocket permet de configurer un serveur TCP dans votre application Java et attendre les connexions des clients. Pour un port donné, il ne peut y avoir qu'une seule instance de ServerSocket.
La classe java.net.Socket permet de :
Configurer un client TCP dans votre application Java et établir la connexion avec un serveur. Si une application Java est connectée à plusieurs serveurs, alors il faut configurer une instance de Socket par serveur. Un client connecté à 3 serveurs a donc 3 instances de Socket.
Finir de configurer le serveur TCP de votre application Java pour qu'il puisse communiquer avec un client. Pour un serveur TCP attendant des connexions sur un port donné, il y a autant d'instances de Socket que de clients connectés. Un serveur connecté à 3 clients a donc une instance de ServerSocket et 3 instances de Socket.

Java为TCP协议提供了两个类：Socket类和ServerSocket类。**一个Socket实例代表了TCP连接的一个客户端，而一个ServerSocket实例代表了TCP连接的一个服务器端，一般在TCP Socket编程中，客户端有多个，而服务器端只有一个，客户端TCP向服务器端TCP发送连接请求，服务器端的ServerSocket实例则监听来自客户端的TCP连接请求，并为每个请求创建新的Socket实例，由于服务端在调用accept（）等待客户端的连接请求时会阻塞，直到收到客户端发送的连接请求才会继续往下执行代码，因此要为每个Socket连接开启一个线程。**

服务器端要同时处理ServerSocket实例和Socket实例，而客户端只需要使用Socket实例。另外，每个Socket实例会关联一个InputStream和OutputStream对象，我们通过将字节写入套接字的OutputStream来发送数据，并通过从InputStream来接收数据。

Socket类对于发送和接受信息是很必要的：  
Envoyer des messages de l'application Java vers la couche TCP de l'hôte, qui se chargera de multiplexer les messages vers la couche IP, qui elle-même enverra ces messages sur le réseau.
Recevoir les messages de la couche IP de l'hôte, après démultiplexage des messages reçus de la couche IP.

* **Configurer un serveur TCP dans une application Java**
```java
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;

public class Server {
    private ServerSocket serverSocket;

    public Server(int port) throws IOException  {
        serverSocket = new ServerSocket(port);
        System.out.println("Server ready at: " + serverSocket);
        Socket clientSocket = serverSocket.accept(); // blocks until a client connects to this server
        System.out.println("New client connexion: " + clientSocket);
    }

    public void close() throws IOException {
        serverSocket.close();
    }

    public static void main(String[] args) throws IOException {
        Server server = new Server(9000); 
        server.close();
    }

}
```

* **Configurer un client TCP dans une application Java**

```java
import java.io.IOException;
import java.net.Socket;

public class Client {

    private Socket socket;

    public Client(String host, int port) throws IOException {
        socket = new Socket(host, port);
        System.out.println("Socket ready: " + socket);
    }

    public void close() throws IOException {
        socket.close();
    }

    public static void main(String[] args) throws IOException {
        Client client = new Client("127.0.0.1", 9000); // use port configured in the server code
        client.close();
    }

}

```

Il est important de penser à fermer les sockets quand le client et le serveur ont fini de communiquer. Cela permet de libérer les ports TCP utilisés pour d'autres applications. C'est ce que font les appels à la méthode `close()`.


**?** Connectez votre client à un serveur distant

### Erreurs d'adressage fréquentes

L'adressage pose quelques difficultés :

* Si le serveur TCP n'est pas prêt à accepter les connexions sur un port donné, et si une application Java essaye de créer un client TCP qui se connecte à ce serveur, alors une exception sera levée dans l'application cliente.  
* Un port est attribué à un et un seul serveur TCP. Quand un serveur TCP s'exécute et attend des connexions clientes sur un port, ce port est occupé. Si une application Java essaie de créer un serveur TCP sur un port occupé, une exception est levée.

Ces problèmes d'adressage entraînent des levées d'exception de super-type java.io.IOException :

* Serveur : essayer de configurer un port déjà occupé lève une java.net.BindException avec un message Address already in use.  
* Client : si le serveur n'est pas en attente de connexion à l'adresse IP et sur le port configurés, une java.net.ConnectException est levée avec un message Connection refused. Dans ce cas, il faut vérifier deux choses :  
    * Le serveur est bien lancé à l'adresse IP configurée dans le code du client.  
    * Le serveur occupe bien le port configuré dans le code du client.

Ces erreurs de manipulations peuvent être facilement évitées en utilisant les consoles intégrées à Eclipse. En particulier :

* si le bouton Terminate en rouge est toujours présent dans la console du serveur, cela peut expliquer un erreur de type "Address already in use".
* si aucune console ne comporte de bouton Terminate, cela peut expliquer une erreur de type "Connection refused" vers un serveur localisé sur le même hôte que le client.

java.net.Socket 类代表一个套接字，并且 java.net.ServerSocket 类为服务器程序提供了一种来监听客户端，并与他们建立连接的机制。

以下步骤在两台计算机之间使用套接字建立TCP连接时会出现：

服务器实例化一个 ServerSocket 对象，表示通过服务器上的端口通信。

服务器调用 ServerSocket 类的 accept() 方法，该方法将一直等待，直到客户端连接到服务器上给定的端口。

服务器正在等待时，一个客户端实例化一个 Socket 对象，指定服务器名称和端口号来请求连接。

Socket 类的构造函数试图将客户端连接到指定的服务器和端口号。如果通信被建立，则在客户端创建一个 Socket 对象能够与服务器进行通信。

在服务器端，accept() 方法返回服务器上一个新的 socket 引用，该 socket 连接到客户端的 socket。

连接建立后，通过使用 I/O 流在进行通信，每一个socket都有一个输出流和一个输入流，客户端的输出流连接到服务器端的输入流，而客户端的输入流连接到服务器端的输出流。

TCP 是一个双向的通信协议，因此数据可以通过两个数据流在同一时间发送.以下是一些类提供的一套完整的有用的方法来实现 socket。

ServerSocket 类的方法
服务器应用程序通过使用 java.net.ServerSocket 类以获取一个端口,并且侦听客户端请求。