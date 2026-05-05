// /**
//  * Генератор вариантов множеств для диаграммы Хассе на отношении делимости.
//  *
//  * Все множества — подмножества делителей числа 2520 = 2³·3²·5·7,
//  * поэтому любая пара множеств из пула корректно комбинируется:
//  * даёт ветвящуюся диаграмму с несравнимыми элементами и нетривиальным НОК.
//  *
//  * Пул из 20 множеств → 190 уникальных вариантов (пар).
//  */
// export class VariantGenerator {
//     /**
//      * Предвычисленный пул из 20 "хороших" 5-элементных множеств.
//      * Каждое множество:
//      *   - содержит делители 2520 (>1, <2520)
//      *   - использует ≥2 различных простых множителя
//      *   - имеет ≥3 несравнимых пары (не цепочка)
//      * Любая пара множеств из пула:
//      *   - объединение 7–10 элементов
//      *   - ≥2 простых ветви
//      *   - ≥5 несравнимых пар
//      *   - глубина цепочки ≥3
//      */
//     private static readonly POOL: number[][] = [
//         [4, 9, 10, 21, 36],     // #1:  2²,3²,2·5,3·7,2²·3²
//         [6, 14, 15, 20, 63],    // #2:  2·3,2·7,3·5,2²·5,3²·7
//         [3, 10, 14, 45, 56],    // #3:  3,2·5,2·7,3²·5,2³·7
//         [5, 12, 14, 18, 35],    // #4:  5,2²·3,2·7,2·3²,5·7
//         [4, 15, 21, 18, 40],    // #5:  2²,3·5,3·7,2·3²,2³·5
//         [6, 10, 21, 8, 45],     // #6:  2·3,2·5,3·7,2³,3²·5
//         [9, 14, 40, 3, 35],     // #7:  3²,2·7,2³·5,3,5·7
//         [3, 8, 35, 18, 20],     // #8:  3,2³,5·7,2·3²,2²·5
//         [5, 12, 7, 36, 40],     // #9:  5,2²·3,7,2²·3²,2³·5
//         [4, 7, 15, 18, 56],     // #10: 2²,7,3·5,2·3²,2³·7
//         [9, 10, 28, 6, 35],     // #11: 3²,2·5,2²·7,2·3,5·7
//         [6, 5, 28, 9, 40],      // #12: 2·3,5,2²·7,3²,2³·5
//         [6, 14, 20, 9, 56],     // #13: 2·3,2·7,2²·5,3²,2³·7
//         [7, 12, 10, 45, 8],     // #14: 7,2²·3,2·5,3²·5,2³
//         [5, 6, 28, 36, 35],     // #15: 5,2·3,2²·7,2²·3²,5·7
//         [4, 9, 14, 15, 40],     // #16: 2²,3²,2·7,3·5,2³·5
//         [7, 18, 20, 12, 5],     // #17: 7,2·3²,2²·5,2²·3,5
//         [3, 8, 14, 45, 20],     // #18: 3,2³,2·7,3²·5,2²·5
//         [6, 35, 4, 9, 20],      // #19: 2·3,5·7,2²,3²,2²·5
//         [10, 21, 8, 15, 12],    // #20: 2·5,3·7,2³,3·5,2²·3
//     ];

//     /** НОК двух чисел */
//     private static lcm2(a: number, b: number): number {
//         const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
//         return (a * b) / gcd(a, b);
//     }

//     /** НОК массива */
//     private static lcmArray(nums: number[]): number {
//         return nums.reduce((acc, n) => this.lcm2(acc, n));
//     }

//     /** Количество множеств в пуле */
//     static get poolSize(): number {
//         return this.POOL.length;
//     }

//     /** Общее количество вариантов (пар) */
//     static get totalVariants(): number {
//         const n = this.POOL.length;
//         return (n * (n - 1)) / 2;
//     }

//     /**
//      * Возвращает пул всех множеств (отсортированных).
//      */
//     static getPool(): number[][] {
//         return this.POOL.map(s => [...s].sort((a, b) => a - b));
//     }

//     /**
//      * Генерирует вариант по номеру (1-based).
//      * Вариант — пара множеств из пула.
//      */
//     static generate(variantNumber: number): {
//         set1: number[];
//         set2: number[];
//         union: number[];
//         lcm: number;
//         totalElements: number;
//         variantLabel: string;
//     } {
//         const n = this.POOL.length;
//         const totalPairs = (n * (n - 1)) / 2;
//         const idx = (((variantNumber - 1) % totalPairs) + totalPairs) % totalPairs;

//         // Маппинг линейного индекса → пара (i, j)
//         let pi = 0, pj = 1;
//         let count = 0;
//         outer:
//         for (pi = 0; pi < n; pi++) {
//             for (pj = pi + 1; pj < n; pj++) {
//                 if (count === idx) break outer;
//                 count++;
//             }
//         }

//         const i = pi, j = pj;

//         const set1 = [...this.POOL[i]].sort((a, b) => a - b);
//         const set2 = [...this.POOL[j]].sort((a, b) => a - b);
//         const union = Array.from(new Set([...set1, ...set2])).sort((a, b) => a - b);
//         const lcm = this.lcmArray(union);
//         const allElements = Array.from(new Set([...union, lcm])).sort((a, b) => a - b);

//         return {
//             set1,
//             set2,
//             union,
//             lcm,
//             totalElements: allElements.length,
//             variantLabel: `Вариант ${variantNumber} (множества #${i + 1} и #${j + 1}, НОК = ${lcm})`,
//         };
//     }
// }
export class VariantGenerator {

    private static readonly POOL: number[][] = [
        [4, 9, 10, 21, 36],
        [6, 14, 15, 20, 63],
        [3, 10, 14, 45, 56],
        [5, 12, 14, 18, 35],
        [4, 15, 21, 18, 40],
        [6, 10, 21, 8, 45],
        [9, 14, 40, 3, 35],
        [3, 8, 35, 18, 20],
        [5, 12, 7, 36, 40],
        [4, 7, 15, 18, 56],
        [9, 10, 28, 6, 35],
        [6, 5, 28, 9, 40],
        [6, 14, 20, 9, 56],
        [7, 12, 10, 45, 8],
        [5, 6, 28, 36, 35],
        [4, 9, 14, 15, 40],
        [7, 18, 20, 12, 5],
        [3, 8, 14, 45, 20],
        [6, 35, 4, 9, 20],
        [10, 21, 8, 15, 12],
    ];

    /** Проверка пересечения множеств */
    private static haveIntersection(a: number[], b: number[]): boolean {
        const setA = new Set(a);
        return b.some(x => setA.has(x));
    }

    /** Получение всех допустимых пар (без пересечений) */
    private static getValidPairs(): [number, number][] {
        const pairs: [number, number][] = [];
        const n = this.POOL.length;

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                if (!this.haveIntersection(this.POOL[i], this.POOL[j])) {
                    pairs.push([i, j]);
                }
            }
        }

        return pairs;
    }

    /** НОД */
    private static gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    /** НОК двух чисел */
    private static lcm2(a: number, b: number): number {
        return (a * b) / this.gcd(a, b);
    }

    /** НОК массива */
    private static lcmArray(nums: number[]): number {
        return nums.reduce((acc, n) => this.lcm2(acc, n));
    }

    /** Количество допустимых вариантов */
    static get totalVariants(): number {
        return this.getValidPairs().length;
    }

    /** Генерация варианта */
    static generate(variantNumber: number): {
        set1: number[];
        set2: number[];
        union: number[];
        lcm: number;
        totalElements: number;
        variantLabel: string;
    } {
        const validPairs = this.getValidPairs();

        if (validPairs.length === 0) {
            throw new Error("Нет допустимых пар множеств без пересечений");
        }

        const idx =
            (((variantNumber - 1) % validPairs.length) + validPairs.length) %
            validPairs.length;

        const [i, j] = validPairs[idx];

        const set1 = [...this.POOL[i]].sort((a, b) => a - b);
        const set2 = [...this.POOL[j]].sort((a, b) => a - b);

        const union = [...set1, ...set2].sort((a, b) => a - b);

        const lcm = this.lcmArray(union);

        const allElements = [...union, lcm].sort((a, b) => a - b);

        return {
            set1,
            set2,
            union,
            lcm,
            totalElements: allElements.length,
            variantLabel: `Вариант ${variantNumber} (множества #${i + 1} и #${j + 1}, без пересечений, НОК = ${lcm})`,
        };
    }
}
