/* TODO: ugly hack, lets hope we can use immutable v4 with typescript quickly
 * check TypeScript#17070, immutable-js#1265
 */
import "immutable";

declare module "immutable"{
    function hash(value: any): number;

    interface ValueObject {
        equals(other: this): boolean;
        hashCode(): number;
    }
}
