import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Alert,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import { fetchAutocompleteSuggestions } from '../../services/aiFeatureApi';

const AiAutocompleteField = ({ field, value, onChange, error, labelElement }) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState(field.options || []);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  
  const cache = React.useRef({});

  React.useEffect(() => {
    let active = true;

    if (inputValue.length < 2) {
      setOptions(field.options || []);
      return undefined;
    }

    const localMatch = (field.options || []).filter(opt => 
      opt.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    if (localMatch.length > 0) {
       setOptions(localMatch);
       return undefined;
    }

    const cacheKey = `${field.label}_${inputValue}`;
    if (cache.current[cacheKey]) {
       setOptions(cache.current[cacheKey]);
       return undefined;
    }

    setLoading(true);

    const timer = setTimeout(async () => {
      const response = await fetchAutocompleteSuggestions(field.label, inputValue, field.options);
      if (active) {
        let newOptions = response.suggestions ? response.suggestions.map(s => s.value) : [];
        newOptions = Array.from(new Set([...(field.options || []), ...newOptions]));
        cache.current[cacheKey] = newOptions;
        setOptions(newOptions);
        setLoading(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, field.label, field.options]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      value={value || null}
      onChange={(event, newValue) => {
        onChange(newValue || '');
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      options={options}
      loading={loading}
      freeSolo
      renderInput={(params) => (
        <TextField
          {...params}
          label={labelElement}
          error={Boolean(error)}
          helperText={error || ''}
          required={field.required}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
    />
  );
};


function buildInitialValues(schema, autoFillData = {}) {
  if (!Array.isArray(schema)) return {};
  return schema.reduce((accumulator, field) => {
    const key = field.label || 'Untitled Field';

    if (field.type === 'declaration' || field.type === 'heading') {
      return accumulator;
    }

    if (field.type === 'rating_matrix') {
      const matrixValue = {};
      (field.rows || []).forEach(row => {
        matrixValue[row] = '';
      });
      if (autoFillData[key]) {
        accumulator[key] = { ...matrixValue, ...autoFillData[key] };
      } else {
        accumulator[key] = matrixValue;
      }
      return accumulator;
    }

    if (autoFillData[key] !== undefined) {
      accumulator[key] = autoFillData[key];
      return accumulator;
    }

    if (field.type === 'checkbox' && Array.isArray(field.options)) {
      accumulator[key] = [];
      return accumulator;
    }

    if (field.type === 'checkbox') {
      accumulator[key] = false;
      return accumulator;
    }

    accumulator[key] = '';
    return accumulator;
  }, {});
}

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

function DynamicFormRenderer({ schema = EMPTY_ARRAY, onSubmit, previewMode = false, isSubmitting = false, autoFillData = EMPTY_OBJECT }) {
  const safeSchema = Array.isArray(schema) ? schema : EMPTY_ARRAY;
  const initialValues = useMemo(() => buildInitialValues(safeSchema, autoFillData), [safeSchema, autoFillData]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setValues(buildInitialValues(safeSchema, autoFillData));
    setErrors({});
  }, [safeSchema, autoFillData]);

  const setFieldValue = (fieldLabel, nextValue) => {
    setValues((current) => ({ ...current, [fieldLabel]: nextValue }));
    setErrors((current) => ({ ...current, [fieldLabel]: '' }));
  };

  const handleCheckboxGroupChange = (fieldLabel, optionValue) => {
    setValues((current) => {
      const currentValues = Array.isArray(current[fieldLabel]) ? current[fieldLabel] : [];
      const nextValues = currentValues.includes(optionValue)
        ? currentValues.filter((item) => item !== optionValue)
        : [...currentValues, optionValue];

      return { ...current, [fieldLabel]: nextValues };
    });
    setErrors((current) => ({ ...current, [fieldLabel]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!Array.isArray(schema)) return false;

    schema.forEach((field) => {
      const rawType = String(field.type || 'text').toLowerCase();
      let type = rawType;
      if (['file', 'file_upload', 'document', 'upload'].includes(rawType)) type = 'file';
      else if (['dropdown', 'select'].includes(rawType)) type = 'dropdown';
      else if (['radio', 'radio_button', 'radiobutton'].includes(rawType)) type = 'radio';

      if (type === 'declaration' || type === 'heading') {
        return;
      }

      const fieldLabel = field.label || 'Untitled Field';
      const value = values[fieldLabel];
      let isEmpty = value === '' || value === null || value === undefined;

      if (type === 'checkbox' && Array.isArray(field.options)) {
        isEmpty = !value || value.length === 0;
      } else if (type === 'checkbox') {
        isEmpty = !value;
      } else if (type === 'file' && field.multiple) {
        isEmpty = !value || value.length === 0;
      } else if (type === 'rating_matrix') {
        const matrixValue = value || {};
        const missingRows = (field.rows || []).filter(row => !matrixValue[row]);
        isEmpty = missingRows.length > 0;
        if (field.required && isEmpty) {
           nextErrors[fieldLabel] = `Please rate all items (${missingRows.length} remaining)`;
           return;
        }
      }

      if (field.required && isEmpty && type !== 'rating_matrix') {
        nextErrors[fieldLabel] = 'This field is required';
        return;
      }

      if (!isEmpty) {
        if (type === 'number') {
          const numValue = Number(value);
          if (field.min !== undefined && numValue < field.min) {
            nextErrors[fieldLabel] = `Must be at least ${field.min}`;
          } else if (field.max !== undefined && numValue > field.max) {
            nextErrors[fieldLabel] = `Must be at most ${field.max}`;
          }
        }

        if (type === 'text' || type === 'textarea') {
          const strValue = String(value);
          if (field.minLength !== undefined && strValue.length < field.minLength) {
            nextErrors[fieldLabel] = `Must be at least ${field.minLength} characters`;
          } else if (field.maxLength !== undefined && strValue.length > field.maxLength) {
            nextErrors[fieldLabel] = `Must be at most ${field.maxLength} characters`;
          }
        }

        if (field.pattern) {
          try {
            const regex = new RegExp(field.pattern);
            if (!regex.test(String(value))) {
              nextErrors[fieldLabel] = 'Please enter a valid value';
            }
          } catch (e) {
            console.error(`Invalid regex pattern for field ${fieldLabel}:`, e);
          }
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (isSubmitting) return;

    if (previewMode) {
      alert('This is a preview — no data was saved');
      if (onSubmit) onSubmit(); 
      return;
    }

    if (!validate()) {
      return;
    }

    onSubmit(values);
  };

  const renderField = (field) => {
    const fieldKey = field.label || 'Untitled Field';
    const rawType = String(field.type || 'text').toLowerCase();
    let normalizedType = rawType;
    if (['file', 'file_upload', 'document', 'upload'].includes(rawType)) normalizedType = 'file';
    else if (['dropdown', 'select'].includes(rawType)) normalizedType = 'dropdown';
    else if (['radio', 'radio_button', 'radiobutton'].includes(rawType)) normalizedType = 'radio';
    const fieldError = errors[fieldKey];
    const options = Array.isArray(field.options) ? field.options : [];
    
    const isAutoFilled = autoFillData[fieldKey] !== undefined;
    const labelElement = (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        {fieldKey}
        {isAutoFilled && (
          <Box component="span" sx={{ fontSize: '0.75rem', bgcolor: 'primary.50', color: 'primary.main', px: 1, py: 0.25, borderRadius: 1, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            ✓ Profile
          </Box>
        )}
      </Box>
    );

    const commonTextFieldProps = {
      fullWidth: true,
      label: labelElement,
      required: Boolean(field.required),
      error: Boolean(fieldError),
      helperText: fieldError || '',
      value: values[fieldKey] ?? '',
      onChange: (event) => setFieldValue(fieldKey, event.target.value),
    };

    switch (normalizedType) {
      case 'heading':
        return <h2 key={field.label}>{field.label}</h2>;

      case 'section':
        return <h3 key={field.label}>{field.label}</h3>;

      case 'text':
      case 'tel':
      case 'email':
      case 'number':
        return (
          <TextField
            {...commonTextFieldProps}
            type={normalizedType}
            inputProps={normalizedType === 'number' ? { min: field.min, max: field.max } : undefined}
          />
        );

      case 'autocomplete':
        return (
          <AiAutocompleteField
            field={field}
            value={values[fieldKey]}
            onChange={(val) => setFieldValue(fieldKey, val)}
            error={fieldError}
            labelElement={labelElement}
          />
        );

      case 'date':
        return (
          <TextField
            {...commonTextFieldProps}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'radio':
        return (
          <FormControl error={Boolean(fieldError)} required={Boolean(field.required)}>
            <FormLabel>{labelElement}</FormLabel>
            <RadioGroup
              value={values[fieldKey] ?? ''}
              onChange={(event) => setFieldValue(fieldKey, event.target.value)}
            >
              {options.map((option, idx) => (
                <FormControlLabel key={`${option}-${idx}`} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            <FormHelperText>{fieldError || ''}</FormHelperText>
          </FormControl>
        );

      case 'checkbox':
        if (options.length > 0) {
          return (
            <FormControl error={Boolean(fieldError)} required={Boolean(field.required)}>
              <FormLabel>{labelElement}</FormLabel>
              <FormGroup>
                {options.map((option, idx) => (
                  <FormControlLabel
                    key={`${option}-${idx}`}
                    control={
                      <Checkbox
                        checked={Array.isArray(values[fieldKey]) && values[fieldKey].includes(option)}
                        onChange={() => handleCheckboxGroupChange(fieldKey, option)}
                      />
                    }
                    label={option}
                  />
                ))}
              </FormGroup>
              <FormHelperText>{fieldError || ''}</FormHelperText>
            </FormControl>
          );
        }

        return (
          <FormControl error={Boolean(fieldError)} required={Boolean(field.required)}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={Boolean(values[fieldKey])}
                  onChange={(event) => setFieldValue(fieldKey, event.target.checked)}
                />
              }
              label={labelElement}
            />
            <FormHelperText>{fieldError || ''}</FormHelperText>
          </FormControl>
        );

      case 'dropdown':
      case 'select':
        return (
          <FormControl fullWidth error={Boolean(fieldError)} required={Boolean(field.required)}>
            <FormLabel>{labelElement}</FormLabel>
            <Select
              value={values[fieldKey] ?? ''}
              onChange={(event) => setFieldValue(fieldKey, event.target.value)}
              displayEmpty
            >
              <MenuItem value="">
                <em>Select {field.label}</em>
              </MenuItem>
              {options.map((option, idx) => (
                <MenuItem key={`${option}-${idx}`} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>{fieldError || ''}</FormHelperText>
          </FormControl>
        );

      case 'textarea':
        return (
          <TextField
            {...commonTextFieldProps}
            multiline
            rows={4}
          />
        );

      case 'declaration':
        return (
          <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, color: 'text.secondary', fontStyle: 'italic' }}>
            {field.label}
          </Box>
        );

      case 'rating_matrix':
        return (
          <FormControl fullWidth error={Boolean(fieldError)} required={Boolean(field.required)} sx={{ mt: 1, mb: 1 }}>
            <FormLabel sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>{labelElement}</FormLabel>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ccc' }}></th>
                    {(field.columns || []).map(col => (
                      <th key={col} style={{ padding: '8px', borderBottom: '1px solid #ccc', textAlign: 'center', fontWeight: 500 }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(field.rows || []).map(row => (
                    <tr key={row} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ textAlign: 'left', padding: '12px 8px', fontSize: '0.95rem' }}>{row}</td>
                      {(field.columns || []).map(col => (
                        <td key={col} style={{ padding: '8px', textAlign: 'center' }}>
                          <Radio
                            checked={values[fieldKey]?.[row] === col}
                            onChange={() => {
                              const matrixVal = { ...(values[fieldKey] || {}) };
                              matrixVal[row] = col;
                              setFieldValue(fieldKey, matrixVal);
                            }}
                            inputProps={{ 'aria-label': col }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <FormHelperText>{fieldError || ''}</FormHelperText>
          </FormControl>
        );

      case 'file': {
        const accept = field.accept || field.allowedTypes || field.fileTypes || undefined;
        const isMultiple = Boolean(field.multiple);
        
        return (
          <TextField
            {...commonTextFieldProps}
            type="file"
            InputLabelProps={{ shrink: true }}
            inputProps={{ 
              multiple: isMultiple,
              accept: accept
            }}
            value={undefined}
            onChange={(e) => {
              if (isMultiple) {
                setFieldValue(fieldKey, e.target.files.length > 0 ? e.target.files : null);
              } else {
                setFieldValue(fieldKey, e.target.files.length > 0 ? e.target.files[0] : null);
              }
            }}
          />
        );
      }

      default:
        console.warn("Unsupported form element type:", field.type, field);
        return null;
    }
  };

  if (!Array.isArray(schema)) {
    return (
      <Alert severity="error">
        This form's data is invalid or corrupted. Please contact the administrator.
      </Alert>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {previewMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          PREVIEW MODE — not a real submission.
        </Alert>
      )}
      <Stack spacing={3}>
        {schema.map((field, index) => {
          const fieldKey = field.label || `Untitled Field ${index}`;
          return <Box key={`${fieldKey}-${index}`}>{renderField(field)}</Box>;
        })}

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Stack>
    </Box>
  );
}

export default DynamicFormRenderer;