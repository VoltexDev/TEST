import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-full md:w-64 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="h-48 bg-gray-200 dark:bg-gray-700" />
            <CardContent className="py-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            </CardContent>
            <CardFooter>
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
