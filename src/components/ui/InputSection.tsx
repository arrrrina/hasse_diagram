// components/hasse/InputSection.tsx
import React, { useState } from 'react';
import { Graph } from '../../lib/core/Graph';
import { HasseDiagram } from '../../lib/algorithms/HasseDiagram';
import { VariantGenerator } from '../../lib/algorithms/VariantGenerator';
import './styles/InputSection.css';

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
const lcmOfArray = (numbers: number[]): number => {
    if (numbers.length === 0) return 1;
    return numbers.reduce((acc, num) => lcm(acc, num), numbers[0]);
};

interface InputSectionProps {
    input1: string;
    input2: string;
    error: string;
    isDirected: boolean;
    onInput1Change: (value: string) => void;
    onInput2Change: (value: string) => void;
    onErrorChange: (error: string) => void;
    onGraphBuilt: (graph: Graph<number, any>) => void;
    onDiagramBuilt: (graph: Graph<number, any>) => void;
}

export const InputSection: React.FC<InputSectionProps> = ({
    input1,
    input2,
    error,
    isDirected,
    onInput1Change,
    onInput2Change,
    onErrorChange,
    onGraphBuilt,
    onDiagramBuilt
}) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            onErrorChange('');
            const numbers = Array.from(new Set([
                ...input1.split(' ').map(num => num.trim()).filter(num => num !== ''),
                ...input2.split(' ').map(num => num.trim()).filter(num => num !== '')
            ].map(num => {
                const parsed = parseInt(num, 10);
                if (isNaN(parsed)) throw new Error(`"${num}" не является числом`);
                return parsed;
            })));

            if (numbers.length === 0) {
                throw new Error('Не найдено допустимых чисел для обработки');
            }
            
            const lcmValue = lcmOfArray(numbers);
            const numbersWithLCM = Array.from(new Set([1, ...numbers, lcmValue]));

            const numberGraph = Graph.createNumberGraph(numbersWithLCM);
            const hasseDiagram = HasseDiagram.buildHasseDivisionDiagram(numberGraph);
            
            onGraphBuilt(hasseDiagram);
            if (isDirected) {
                onDiagramBuilt(hasseDiagram);
            } else {
                console.log('Пропускаем onDiagramBuilt, граф неориентирован');
            }

        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    const [variantNumber, setVariantNumber] = useState(1);

    const handleGenerate = () => {
        try {
            onErrorChange('');
            const variant = VariantGenerator.generate(variantNumber);
            onInput1Change('1 ' + variant.set1.join(' '));
            onInput2Change(variant.set2.join(' '));
        } catch (err) {
            onErrorChange(err instanceof Error ? err.message : String(err));
        }
    };

    return (
        <div className="input-section">
            <div className="input-section-header">
                <h2 className="input-section-title">Построение диаграммы Хассе</h2>
            </div>

            <div className="variant-generator">
                <label htmlFor="variant-number" className="input-label">
                    Номер варианта (1–{VariantGenerator.totalVariants})
                </label>
                <div className="variant-controls">
                    <input
                        id="variant-number"
                        type="number"
                        min={1}
                        max={VariantGenerator.totalVariants}
                        value={variantNumber}
                        onChange={(e) => setVariantNumber(Number(e.target.value))}
                        className="input-field variant-input"
                    />
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="generate-button"
                    >
                        Сгенерировать вариант
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="input-form">
                <div className="input-fields">
                    <div className="input-group">
                        <label htmlFor="numbers-input1" className="input-label">
                            Первый набор чисел
                        </label>
                        <input
                            id="numbers-input1"
                            type="text"
                            value={input1}
                            onChange={(e) => onInput1Change(e.target.value)}
                            placeholder="Например: 2 4 8"
                            className="input-field"
                        />
                    </div>
                    
                    <div className="input-group">
                        <label htmlFor="numbers-input2" className="input-label">
                            Второй набор чисел
                        </label>
                        <input
                            id="numbers-input2"
                            type="text"
                            value={input2}
                            onChange={(e) => onInput2Change(e.target.value)}
                            placeholder="Например: 3 6 12"
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-button primary-button"
                    >
                        Построить диаграмму
                    </button>
                </div>
            </form>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};