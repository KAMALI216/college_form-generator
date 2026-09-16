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
} from '@mui/material';

function buildInitialValues(schema, autoFillData = {}) {
  if (!Array.isArray(schema)) return {};
  return schema.reduce((accumulator, field) => {
    const key = field.label || 'Untitled Field';

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

function DynamicFormRenderer({ schema = [], onSubmit, previewMode = false, isSubmitting = false, autoFillData = {} }) {
  const safeSchema = Array.isArray(schema) ? schema : [];
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
      const fieldLabel = field.label || 'Untitled Field';
      const value = values[fieldLabel];
      let isEmpty = value === '' || value === null || value === undefined;

      if (field.type === 'checkbox' && Array.isArray(field.options)) {
        isEmpty = !value || value.length === 0;
      } else if (field.type === 'checkbox') {
        isEmpty = !value;
      }

      if (field.required && isEmpty) {
        nextErrors[fieldLabel] = 'This field is required';
        return;
      }

      if (!isEmpty) {
        if (field.type === 'number') {
          const numValue = Number(value);
          if (field.min !== undefined && numValue < field.min) {
            nextErrors[fieldLabel] = `Must be at least ${field.min}`;
          } else if (field.max !== undefined && numValue > field.max) {
            nextErrors[fieldLabel] = `Must be at most ${field.max}`;
          }
        }

        if (field.type === 'text' || field.type === 'textarea') {
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
    const fieldType = String(field.type || 'text').toLowerCase();
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

    switch (fieldType) {
      case 'text':
      case 'tel':
      case 'email':
      case 'number':
        return (
          <TextField
            {...commonTextFieldProps}
            type={fieldType}
            inputProps={fieldType === 'number' ? { min: field.min, max: field.max } : undefined}
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
              {options.map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
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
                {options.map((option) => (
                  <FormControlLabel
                    key={option}
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
                <em>Select an option</em>
              </MenuItem>
              {options.map((option) => (
                <MenuItem key={option} value={option}>
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

      default:
        console.warn(`Unknown field type: ${field.type}`);
        return (
          <Box>
            <TextField
              {...commonTextFieldProps}
              type="text"
            />
            <FormHelperText>Note: unrecognized field type '{fieldType}', shown as text input.</FormHelperText>
          </Box>
        );
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
          return <Box key={fieldKey}>{renderField(field)}</Box>;
        })}

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </Stack>
    </Box>
  );
}

export default DynamicFormRenderer;