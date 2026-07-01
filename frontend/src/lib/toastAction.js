import { toast } from 'react-toastify'

/** Junta o toast de loading + a chamada + o toast de sucesso/erro que se repetia em várias páginas. */
export async function runWithToast(
  {
    loading,
    success,
    error,
    successAutoClose = 1200,
    errorAutoClose = 2500,
    onStart,
    onSettle,
  },
  action,
) {
  const toastId = toast.loading(loading)
  onStart?.()
  try {
    const result = await action()
    toast.update(toastId, {
      render: success,
      type: 'success',
      isLoading: false,
      autoClose: successAutoClose,
    })
    return result
  } catch (err) {
    toast.update(toastId, {
      render: err?.response?.data?.message || error,
      type: 'error',
      isLoading: false,
      autoClose: errorAutoClose,
    })
    return undefined
  } finally {
    onSettle?.()
  }
}
