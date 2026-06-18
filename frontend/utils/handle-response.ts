import { notFound } from "next/navigation"

export const handleResponse = async (res: Response) => {
  const contentType = res.headers.get("content-type") ?? ""
  const isJson = contentType.includes("application/json")

  let data: unknown
  if (isJson) {
    data = await res.json()
  } else {
    const text = await res.text()
    if (!res.ok) {
      throw new Error(`Request failed (${res.status})`)
    }
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error("Server returned an unexpected response.")
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof (data as { message: unknown }).message === "string"
        ? (data as { message: string }).message
        : "Something went wrong!"
    throw new Error(message)
  }
  if (res.status === 404) {
    notFound()
  }
  return data
}

export default handleResponse
