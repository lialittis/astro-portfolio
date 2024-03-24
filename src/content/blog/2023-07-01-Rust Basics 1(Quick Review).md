---
layout:     ../../layouts/LayoutBlogPost.astro
title:      "Rust Basics 1(Quick Review)"
# subtitle:   Rust Tutorial
escription: "this is a post example"
pubDate:       2023-07-01
# author:     TC YU
# catagory:   "coding"
tags:
    - Rust
categories:
    - Tutorials
# layout: ../../layouts/LayoutBlogPost.astro
# title: "Hello, World"
# description: "this is a post example"
# pubDate: 2023-01-21
# category: "intro"
---


# Rust Basics(1)

## Anatomy of a Rust Program

- indent with four spaces, not a tab
- `println!` calls a Rust marco
- end the line with a semicolon(;)

## Compiling and Running Are Seperate Steps

Rust is an *ahead-of-time* compiled language.

## Cargo

Cargo creats a project in a new directory and initializes a new Git repository along with a `.gitignore`
file.

```
Note: Git is a common version control system. You can change cargo new to use a different version control 
system or no version control system by using the --vcs flag. Run cargo new --help to see the available 
options.
```
Cargo expects sources files to live inside the `src` directory and puts the binary in a directory named
`debug`.

- `cargo new`
- `cargo build`
- `cargo run`
- `cargo check`

### TOML(Tom's Obvious, Minimal Language)

It is Cargo's configuration format.

### Building for Release

`cargo build --release` compile the project with optimizations.

## Crate

A `crate` is a collection of Rust source code files. For example, the `rand` crate is a *library* crate,
which contains code that is intended to be used in other programs.

### external crates

The external crates are added into projects as dependencies. Cargo fetches the latest versions of everything
that dependency needs from the *registry*, which is a copy of data from `Crates.io`.

### Cargo.lock

If `Cargo.lock` exists, Cargo will use the versions specified there rather than doing all the work of
figuring out versions again, which lets us have a reproducible build automatically.

### update

```
cargo update
```

helps you to update a crate.

# Common Programming Concepts

## Variables and Mutability

By default, variables in Rust are immutable.

You would get compile-time errors when we attempt to change a value that is designated as immutable.

### Constants

Like immutable variables, but constants:
- don't accept mut syntax.
- use const keyword
- the type of the value must be annotated

### Shadowing

```rust
fn main() {
    let x = 5;

    let x = x + 1;

    {
        let x = x * 2;
        println!("The value of x in the inner scope is: {x}");
    }

    println!("The value of x is: {x}");
}
```

When you run it:

```shell
$ cargo run
   Compiling variables v0.1.0 (file:///projects/variables)
    Finished dev [unoptimized + debuginfo] target(s) in 0.31s
     Running `target/debug/variables`
The value of x in the inner scope is: 12
The value of x is: 6
```

But shadowing:
- we create a new variable
- we can change the type of the value

## Data Types

Rust is a statically typed language, it must know the types of all variables at compile time.

### Scalar Types

Four primary scalar types : integers, floating-point numbers, Booleans and characters.

#### Integer Types

Integer Literals in Rust

```
Number literals	Example
Decimal	98_222
Hex	0xff
Octal	0o77
Binary	0b1111_0000
Byte (u8 only)	b'A'
```

Integer Overflow

- In debug mode, Rust includes checks for integer overflow and cause the program to `panic` at runtime.
- In release mode, Rust performs *two's complement wrapping* for the value, and the program won't panic.

#### Floating-point Types

Two primitive types : numbers with decimal points f32 and f64.

```
fn main() {
    let x = 2.0; // f64

    let y: f32 = 3.0; // f32
}
```

### Boolean Type

`true` and `false`

### Character Type

Four bytes in size and Unicode Scalar Value.

### Compound Types

#### Tuple

- a variety fo types
- a fixed length
- comma-separated list
- access a tuple element by using a period (.) followed by the index
- tuple without any values has a special name, *unit* : an empty value ()

```
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

```
fn main() {
    let tup = (500, 6.4, 1);

    let (x, y, z) = tup;

    println!("The value of y is: {y}");
}
```
#### Array

- same type
- a fixed lenght
- comma-separated list
- access elements by using indexing

```
fn main() {
    let a = [1, 2, 3, 4, 5];
    
    let a: [i32; 5] = [1, 2, 3, 4, 5];

    let a = [3; 5]; // equal to [3, 3, 3, 3, 3];

    let first = a[0];
    let second = a[1];

}
```

Arrays are useful when you want your data allocated on the stack rather than the heap.

**Runtime error : invalid array element access:**
```
use std::io;

fn main() {
    let a = [1, 2, 3, 4, 5];

    println!("Please enter an array index.");

    let mut index = String::new();

    io::stdin()
        .read_line(&mut index)
        .expect("Failed to read line");

    let index: usize = index
        .trim()
        .parse()
        .expect("Index entered was not a number");

    let element = a[index];

    println!("The value of the element at index {index} is: {element}");
}
```
The program resulted in a runtime error at the point of using an invalid value in the indexing operation.
This check has to happen at runtime, especially in this case, because the compiler can’t possibly know 
what value a user will enter when they run the code later.

## Functions

Functions are prevalent in Rust code.

Rust code uses *snake case* as the conventional style for function and variable names.

```
fn main() {
    println!("Hello, world!");

    another_function();
}

fn another_function() {
    println!("Another function.");
}
```

In function signatures, you must declare the type of each parameter. **Requiring type annotations in 
function definitions means the compiler almost never needs you to use them elsewhere in the code to 
figure out what type you mean**.

### Statements and Expressions

Function bodies are made up of a series of statements optionally ending in an expression.

- Statements are instructions that perform some action and do not return a value.
- Expressions evaluate to a resultant value.

Expressions do not include ending semicolons. If you add a semicolon to the end of an expression, you
turn it into a statement, and it will then not return a value. 

### Functions with Return Values

We must declare the return type after an arrow (->).

We need to have an expression as the return value. If not, there might be mismatched types error.

## Control Flow

### if Expressions

```
if condition {

} else {

}
```

Boolean is expected after `if`, Rust cannot automatically convert non-Boolean to Boolean types.

```
if condition {

} else if condition {

} ... {

} else {

}
```

Using too many `else if` expressions can clutter your code, so if you have more that one, you might
wnat to refactor your code. For example by `match`.

#### Using if in a let Statement

Because `if` is an expression, it could be used on the right side of a `let` statement.

```
fn main() {
    let condition = true;
    let number = if condition { 5 } else { 6 };

    println!("The value of number is: {number}");
}
```

### Repetition with Loops

Loop is an expression.

```
fn main() {
    loop {
        println!("again!");
    }
}
```

#### Returning Values from Loops

```
fn main() {
    let mut counter = 0;

    let result = loop {
        counter += 1;

        if counter == 10 {
            break counter * 2;
        }
    };

    println!("The result is {result}");
}
```

#### Loop Labels to Disambiguate Between Multiple Loops

We could specify a loop label so that we use with `break` or `continue` to specify that those keywords 
apply to the labeled loop instead of the innermost loop.

Note that, the `break` keyword cannot be followed by both a return value and a loop label at the same 
time. The `break` statement is used to exit a loop or a block early, and it can be optionally followed 
by an expression to provide a return value for the enclosing function or block. However, it cannot 
be combined with a loop label.

The labels should be in format like : `'lable`.

#### Conditional Loops with while

```
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{number}!");

        number -= 1;
    }

    println!("LIFTOFF!!!");
}
```

#### Looping Through a Collection with for

```
fn main() {
    let a = [10, 20, 30, 40, 50];

    for element in a {
        println!("the value is: {element}");
    }
}
```

```
fn main() {
    for number in (1..4).rev() {
        println!("{number}!");
    }
    println!("LIFTOFF!!!");
}
```



