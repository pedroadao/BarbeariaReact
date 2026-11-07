import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form'
import { COUNTRIES, buildPhoneValue, findCountryByCode, formatNationalNumber, parsePhoneValue } from '../../lib/phone'

interface PhoneFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  error?: string
  idPrefix: string
}

export function PhoneField<T extends FieldValues>({ control, name, error, idPrefix }: PhoneFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const parsed = parsePhoneValue(String(field.value ?? ''))

        return (
          <Stack direction="row" spacing={1}>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel id={`${idPrefix}-pais-label`}>País</InputLabel>
              <Select
                labelId={`${idPrefix}-pais-label`}
                id={`${idPrefix}-pais`}
                label="País"
                value={parsed.country.code}
                onChange={(event) => {
                  const country = findCountryByCode(event.target.value)
                  field.onChange(buildPhoneValue(country, parsed.digits))
                }}
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.flag} +{country.dial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              id={`${idPrefix}-telefone`}
              label="Telefone"
              type="tel"
              autoComplete="tel-national"
              fullWidth
              error={!!error}
              helperText={error}
              value={formatNationalNumber(parsed.digits, parsed.country.code)}
              onChange={(event) => {
                field.onChange(buildPhoneValue(parsed.country, event.target.value))
              }}
              onBlur={field.onBlur}
            />
          </Stack>
        )
      }}
    />
  )
}
