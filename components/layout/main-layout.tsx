import { StyledHeader } from "@/components/layout/styled-header"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StyledHeader />
      <main>{children}</main>
    </>
  )
}