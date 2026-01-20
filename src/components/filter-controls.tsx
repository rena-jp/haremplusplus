import { ReactNode, useCallback, useState } from 'react';
import { Tooltip } from './common';

export interface FilterControlProps {
  label: string;
  description: string;
  isActive: boolean;
  clear(): void;
  reapply: (() => void) | undefined;
  cssClasses?: string[] | undefined;
}

export interface Range {
  min: number | undefined;
  max: number | undefined;
}

export interface NumberRangeControlProps extends FilterControlProps {
  range: Range;
  setRange(range: Range): void;
}

export const NumberRangeControl: React.FC<NumberRangeControlProps> = ({
  label,
  description,
  range,
  setRange,
  clear,
  reapply,
  isActive,
  cssClasses
}) => {
  const [displayedRange, setDisplayedRange] = useState({
    min: range.min === undefined ? '' : range.min.toString(),
    max: range.max === undefined ? '' : range.max.toString()
  });

  // Update range when input changes
  const updateRange = useCallback(
    (newRange: { min: string; max: string }) => {
      const newMin = validateNumber(newRange.min);
      const newMax = validateNumber(newRange.max);
      if (newMin !== range.min || newMax !== range.max) {
        const propRange = { min: newMin, max: newMax };
        setRange(propRange);
      }
      setDisplayedRange(newRange);
    },
    [setDisplayedRange, setRange, range]
  );

  // Pick values to display. If the values are equivalent, keep the current text as-is.
  // Otherwise, replace with a fresh value from the prop.
  const rangeToDisplay = rangesEquivalent(displayedRange, range)
    ? displayedRange
    : { min: displayNumber(range.min), max: displayNumber(range.max) };

  return (
    <div
      className={`filter-entry${isActive ? '' : ' inactive'}${
        cssClasses === undefined || cssClasses.length === 0
          ? ''
          : ' ' + cssClasses.join(' ')
      }`}
    >
      <FilterHeader
        label={label}
        description={description}
        isActive={isActive}
        clear={clear}
        reapply={reapply}
      />
      <input
        className="hh-text-input number"
        value={rangeToDisplay.min}
        onChange={(ev) =>
          updateRange({ max: rangeToDisplay.max, min: ev.target.value })
        }
      />
      <input
        className="hh-text-input number"
        value={rangeToDisplay.max}
        onChange={(ev) =>
          updateRange({ min: rangeToDisplay.min, max: ev.target.value })
        }
      />
    </div>
  );
};

export interface InputControlProps extends FilterControlProps {
  input: string;
  setInput(input: string): void;
}

export const InputControl: React.FC<InputControlProps> = ({
  label,
  description,
  input,
  setInput,
  clear,
  reapply,
  isActive,
  cssClasses
}) => {
  // Update range when input changes
  const updateInput = useCallback(
    (newInput: string) => {
      setInput(newInput);
    },
    [setInput, input]
  );

  return (
    <div
      className={`filter-entry${isActive ? '' : ' inactive'}${
        cssClasses === undefined || cssClasses.length === 0
          ? ''
          : ' ' + cssClasses.join(' ')
      }`}
    >
      <FilterHeader
        label={label}
        description={description}
        isActive={isActive}
        clear={clear}
        reapply={reapply}
      />
      <input
        className="hh-text-input"
        value={input}
        onChange={(ev) => updateInput(ev.target.value)}
      />
    </div>
  );
};

export interface ToggleListProps {
  options: ToggleOption[];
  values: boolean[];
  setValue(option: ToggleOption, value: boolean): void;
  isActive: boolean;
  setActive(active: boolean): void;
}

export interface ToggleOption {
  label: string;
  description: string;
  styleClasses?: string[];
}

export const ToggleList: React.FC<ToggleListProps> = ({
  options,
  values,
  setValue,
  isActive,
  setActive
}) => {
  const toggleState = useCallback(
    (index: number) => {
      // If we click on an active option while the whole control is disabled,
      // reactivate the filter as-is (without modifying the clicked option)
      if (values[index] && !isActive) {
        setActive(true);
      } else {
        setValue(options[index]!, !values[index]);
      }
    },
    [options, values, setValue, isActive, setActive]
  );

  return (
    <>
      {options.map((option, index) => {
        const toggleStateClass = values[index] ? 'pressed' : 'notpressed';
        const classNames = ['toggle', 'hh-action-button', toggleStateClass];
        if (option.styleClasses) {
          classNames.push(...option.styleClasses);
        }
        return (
          <button
            className={classNames.join(' ')}
            onClick={() => toggleState(index)}
            title={option.description}
            key={index}
          >
            {option.label}
          </button>
        );
      })}
    </>
  );
};

export interface NumberInputWithOptionsProps
  extends FilterControlProps, ToggleListProps {
  input: number | undefined;
  setInput(value: number | undefined): void;
}

export const NumberInputWithOptions: React.FC<NumberInputWithOptionsProps> = ({
  label,
  description,
  input,
  setInput,
  clear,
  reapply,
  options,
  values,
  setValue,
  isActive,
  cssClasses
}) => {
  const [displayedInput, setDisplayedInput] = useState(
    input === undefined ? '' : String(input)
  );

  const updateInput = useCallback(
    (newInput: string) => {
      const newInputValue = validateNumber(newInput);
      if (newInputValue !== input) {
        setInput(newInputValue);
      }
      setDisplayedInput(newInput);
    },
    [setDisplayedInput, setInput, input]
  );

  const setActive = useCallback(
    (active: boolean) => {
      if (reapply !== undefined && active) {
        reapply();
      }
    },
    [reapply]
  );

  return (
    <div
      className={`filter-entry${isActive ? '' : ' inactive'}${
        cssClasses === undefined || cssClasses.length === 0
          ? ''
          : ' ' + cssClasses.join(' ')
      }`}
    >
      <FilterHeader
        label={label}
        description={description}
        isActive={isActive}
        clear={clear}
        reapply={reapply}
      />
      <input
        className="hh-text-input number"
        value={displayedInput}
        onChange={(ev) => updateInput(ev.target.value)}
      />
      <ToggleList
        options={options}
        values={values}
        setValue={setValue}
        isActive={isActive}
        setActive={setActive}
      />
    </div>
  );
};

export interface LabeledToggleProps
  extends FilterControlProps, ToggleListProps {
  // No extra props
}

export const LabeledToggle: React.FC<LabeledToggleProps> = ({
  label,
  description,
  options,
  values,
  isActive,
  clear,
  reapply,
  setValue,
  cssClasses
}) => {
  const setActive = useCallback(
    (active: boolean) => {
      if (reapply !== undefined && active) {
        reapply();
      }
    },
    [reapply]
  );

  return (
    <div
      className={`filter-entry${isActive ? '' : ' inactive'}${
        cssClasses === undefined || cssClasses.length === 0
          ? ''
          : ' ' + cssClasses.join(' ')
      }`}
    >
      <FilterHeader
        label={label}
        description={description}
        isActive={isActive}
        clear={clear}
        reapply={reapply}
      />
      <ToggleList
        options={options}
        values={values}
        setValue={setValue}
        isActive={isActive}
        setActive={setActive}
      />
    </div>
  );
};

function validateNumber(input: string): number | undefined {
  if (input.length === 0) {
    return undefined;
  }
  const result = Number(input);
  return isNaN(result) ? undefined : result;
}

function displayNumber(input: number | undefined): string {
  if (input === undefined) {
    return '';
  }
  return String(input);
}

function rangesEquivalent(
  textRange: { min: string; max: string },
  valueRange: Range
): boolean {
  const validValue = valueRange.min !== undefined;
  const validText = validateNumber(textRange.min) !== undefined;
  if (!validValue) {
    return !validText;
  }
  return (
    valueRange.min === validateNumber(textRange.min) &&
    valueRange.max === validateNumber(textRange.max)
  );
}

interface FilterHeaderProps {
  label: string;
  description: string;
  isActive: boolean;
  clear(): void;
  reapply: (() => void) | undefined;
}

export const FilterHeader: React.FC<FilterHeaderProps> = ({
  label,
  description,
  isActive,
  clear,
  reapply
}) => {
  const filterAction = useCallback(() => {
    if (isActive) {
      clear();
    } else if (reapply !== undefined) {
      reapply();
    } else {
      // Nothing: the filter configuration is not valid
    }
  }, [isActive, clear, reapply]);

  const filterStatus = isActive
    ? 'active'
    : reapply !== undefined
      ? 'ready'
      : 'invalid';

  const statusTooltip =
    filterStatus === 'active'
      ? 'Active. Click to deactivate.'
      : filterStatus === 'ready'
        ? 'Inactive. Click to activate.'
        : 'Invalid. Modify the filter to activate it.';
  const delay = filterStatus === 'invalid' ? 500 : 1500;

  const descriptionLines = description.split('\n');

  return (
    <>
      <label className="filter-label">
        <Tooltip
          tooltip={
            <span>
              {descriptionLines
                .map<ReactNode>((line, index) => (
                  <span key={index}>{line}</span>
                ))
                .reduce((left, right) =>
                  left === null
                    ? [right]
                    : [left, <br key={Math.random()} />, right]
                )}
            </span>
          }
        >
          {label}
        </Tooltip>
      </label>
      <Tooltip delay={delay} tooltip={<span>{statusTooltip}</span>}>
        <div
          className={`qh-filter-status ${filterStatus}`}
          onClick={filterAction}
        ></div>
      </Tooltip>
    </>
  );
};
