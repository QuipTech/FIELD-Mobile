import Svg, { Path } from 'react-native-svg';

import { colors } from '@/theme';

// Brand marks must keep their official colours, so these are the only raw colours outside tokens.
export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityElementsHidden>
      <Path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.4-6.4C35.9 3 30.5 1 24 1 14.6 1 6.5 6.4 2.6 14.1l7.5 5.8C12.1 13.6 17.6 9.5 24 9.5z"
      />
      <Path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.4 5.7c4.3-4 6.8-9.9 6.8-17.4z"
      />
      <Path fill="#FBBC05" d="M10.1 19.9a14.5 14.5 0 0 0 0 8.2l-7.5 5.8a24 24 0 0 1 0-19.8z" />
      <Path
        fill="#34A853"
        d="M24 47c6.5 0 12-2.1 16-5.8l-7.4-5.7c-2.2 1.5-5 2.4-8.6 2.4-6.4 0-11.9-4.1-13.9-9.8l-7.5 5.8C6.5 41.6 14.6 47 24 47z"
      />
    </Svg>
  );
}

export function AppleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden>
      <Path
        fill={colors.ink}
        d="M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3.01-.8-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75s1.79.75 3.01.72c1.25-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.46-3.71zM14.08 5.83c.64-.78 1.07-1.85.95-2.93-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.02.08 2.07-.52 2.71-1.28z"
      />
    </Svg>
  );
}
