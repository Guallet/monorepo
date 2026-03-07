import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="px-4 py-20">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <p className="mb-6 text-5xl font-black leading-none text-muted-foreground sm:text-6xl">
          404
        </p>
        <h1 className="text-3xl font-black sm:text-4xl">
          You have found a secret place.
        </h1>
        <p className="mx-auto mb-8 mt-6 max-w-[500px] text-lg text-muted-foreground">
          Unfortunately, this is only a 404 page. You may have mistyped the
          address, or the page has been moved to another URL.
        </p>
        <Button asChild variant="ghost" size="lg">
          <Link to="/">Take me back to home page</Link>
        </Button>
      </div>
    </div>
  );
}
