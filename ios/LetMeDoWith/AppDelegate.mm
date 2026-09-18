#import "AppDelegate.h"

#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <RNKakaoLogins.h>
#import "RNBootSplash.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"LetMeDoWith";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  if([FIRApp defaultApp] == nil){
    [FIRApp configure];
  }

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

// 루트 뷰 위에 스플래시(BootSplash.storyboard)를 얹는다. JS에서 BootSplash.hide()로 내린다.
- (UIView *)createRootViewWithBridge:(RCTBridge *)bridge
                          moduleName:(NSString *)moduleName
                           initProps:(NSDictionary *)initProps
{
  UIView *rootView = [super createRootViewWithBridge:bridge moduleName:moduleName initProps:initProps];
  [RNBootSplash initWithStoryboard:@"BootSplash" rootView:rootView];
  return rootView;
}

- (BOOL)application:(UIApplication *)app
     openURL:(NSURL *)url
     options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
 if([RNKakaoLogins isKakaoTalkLoginUrl:url]) {
    return [RNKakaoLogins handleOpenUrl: url];
 }

 return NO;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
