import { View } from 'react-native';

interface VisibilityProps extends React.ComponentProps<typeof View> {
  isVisible: boolean;
  children: React.ReactNode;
}

export function Visibility({
  isVisible,
  children,
  ...props
}: Readonly<VisibilityProps>) {
  if (isVisible) {
    return <View {...props}>{children}</View>;
  } else {
    return null;
  }
}
