
export const PageBodyWrapper = ({ children, className, ...props }) => (
  <div className={`${className} h-full`} {...props}>
    {children}
  </div>
)

const PageBodyContainer = ({ children }) => (
  <PageBodyWrapper className="grid grid-cols-12">
    <div className="col-span-12 px-4 lg:px-10 xl:col-span-12 2xl:col-span-10 2xl:col-start-2">
      {children}
    </div>
  </PageBodyWrapper>
)

export default PageBodyContainer
