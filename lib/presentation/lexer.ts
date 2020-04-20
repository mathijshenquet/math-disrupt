
let bracket_left = ["(", "[", "}"];
let bracket_right = [")", "]", "}"];
let punct = ["'", ","];
let spacing = [" ", "\t"];
let operator = ["*", "+", "/"];

/*
Proposition. If l is a left identity, and r is a right identity of the group G
then l = r.

Proof: We have l = r * l = r.

Proposition. If e is a left identity for the group G then e is also a right identity.

For any a in G we have e * a = a. So a = a * e^{-1}. Therefor e^{-1} is the
right identity for G. By proposition 1 then e = e^{-1}.
*/