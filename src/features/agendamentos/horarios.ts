export const HORA_ABERTURA = '09:00'
export const HORA_FECHAMENTO = '19:00'
export const INTERVALO_MINUTOS = 30

export function paraMinutos(horario: string): number {
  const [hora, minuto] = horario.split(':').map(Number)
  return hora * 60 + minuto
}

function minutosParaHorario(minutos: number): string {
  const hora = Math.floor(minutos / 60)
    .toString()
    .padStart(2, '0')
  const minuto = (minutos % 60).toString().padStart(2, '0')
  return `${hora}:${minuto}`
}

function gerarHorarios(inicio: string, fim: string): string[] {
  const minutosInicio = paraMinutos(inicio)
  const minutosFim = paraMinutos(fim)
  const horarios: string[] = []

  for (let minutos = minutosInicio; minutos <= minutosFim; minutos += INTERVALO_MINUTOS) {
    horarios.push(minutosParaHorario(minutos))
  }

  return horarios
}

export const HORARIOS_INICIO = gerarHorarios(HORA_ABERTURA, minutosParaHorario(paraMinutos(HORA_FECHAMENTO) - INTERVALO_MINUTOS))
export const HORARIOS_FIM = gerarHorarios(minutosParaHorario(paraMinutos(HORA_ABERTURA) + INTERVALO_MINUTOS), HORA_FECHAMENTO)

export function proximoHorario(horario: string): string {
  return minutosParaHorario(paraMinutos(horario) + INTERVALO_MINUTOS)
}
