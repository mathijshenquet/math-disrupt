
Nominal Syntax
==============

We us a variant of nominal sets named permissive nominal sets. Permissive nominal
sets are developed by Gabbay et al. The main reference work we will use is
in [NomTNL] but [NomTNL] is very general and doesnt include explicit descriptions
of all the parts of the system. Gabbay's work with Dowek and Mulligan [PernTU]
which is the work introducing permissive sets offer more direction. Dowek's thesis
[Dowek] upon which [PernTU] is based offers a Haskell implementation of permissive
sets.

#TODO add more sources

Since the above sources contain subtle differences among them, we will formally
define what exact version of nominal syntax we are going to use.

Outline
------------
**Nominal sets** refers to the mathematical framework with which the nominal syntax
will be explained and justified. To be specific, nominal sets are sets with a 
 group action and form a topos which make them very suitable to develop 'stuff'
  in, more later. Nominal sets was created by Pitts and his student Gabbay.

**Permissive nominal sets** is a generalization of nominal sets with the aim of making
the development of the syntax easier and more natural. Some formulations of permissive
nominal sets are still a topos, although some formulations lose some properties.

As we will always work with permissive nominal sets, we drop the 'permissive' prefix form now on.

**Nominal terms** nominal terms is the theory of nominal terms build, the collection of
so generated terms will be a nominal set.

#TODO add more later

Nominal sets
------------
Fix a set A of names. These have been referred to as atoms, hence the name.
Let Perm denote the symetic group on A. We will later pick some G \subset Perm
and then look at the category of G-sets. I.e. we will look at sets with a G
action permuting the names.

We will later build a nominal sets of terms for some language so this is useful
intuition: The set A of names corresponds to variables, the elements will be 
terms of some language with varables from A, and the action of Perm 
will correspond to exchanging of variable names. 

Essentially there are two kinds of permutations we are interested in, the first
is the swapping permutation written (a b) \in Perm. This permutation will exchange
the usage of the names a and b in some element. These swapping will be used to
compute alpha equivalence. Name swapping instead of simple renaming has many pleasent 
properties, for example if we wish to rename a to b in a term t we usually have 
to take care that b doesnt allready occur in t, with a swapping action this will
turn out to be less of a problem. 

The second permutation is the so called shift permutation, the goal of the shift
permutation is to 'move all names along and create a new fresh name'. This is a 
bit informal and will be explained later.

Set of names
------------

Let B (for base) be the set of all finite non empty lists of unicode characters 
in the categories \[Letter, Lowercase\] and \[Letter, Uppercase\]. Then define
the set A = B \times Z where Z is are the integers. In this document we will
take A to be only single letters a-z. Write the element (a, n) \in A with 
n >= 0 as the an a with n primes. So that (a, 2) = a'' and (a, 0) = a. For negative
n so (a, -n) \in A we will instead write n commas so that (a, -2) = a,,. We 
will rarely write those and our system doens't allow users to input them. 

This definition of A as B \times Z is motivated by the fact that we want to
have the ability to create fresh names. Suppose we have a term X and want to 
create a term \lambda a. X without binding a in X. The original definition of 
nominal sets imposed a restriction in the form of a freshness context on X but
we might not be able to do that in general. Instead what we do is that we apply 
the following infinite permutation to X: we shift each (a, n) -> (a, n+1) this
permutation is called shift_a. If we can than guarentee that X didnt mention 
(a, -1) we are free to create \a. shift_a X.

Terms
-----

The terms of the language admit a 

A signature sigma for nominal terms is given by the following datums.  


Permutations
------------

The permutations of our theory are generated by the swappings and the shifts.  

Permission set
--------------

A permission set is the set of allowed variables in a term. We start with one
basic permission set called A>= defined by A>= = {(a, n) \in A | n >= 0}. All
others will be derived from this set by applying the permutations. 


[NomTNL]:
    Murdoch J Gabbay, 2012,
    NOMINAL TERMS AND NOMINAL LOGICS: FROM FOUNDATIONS TO META-MATHEMATICS
    http://www.gabbay.org.uk/papers/nomtnl.pdf