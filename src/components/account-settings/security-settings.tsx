import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff } from 'lucide-react'
import { FaCircleCheck, FaRegCircle } from 'react-icons/fa6'

interface SecuritySettingsProps {
    password: string
    setPassword: (password: string) => void
    newPassword: string
    setNewPassword: (password: string) => void
    showPassword: boolean
    setShowPassword: (show: boolean) => void
    showNewPassword: boolean
    setShowNewPassword: (show: boolean) => void
}

export function SecuritySettings({
    password,
    setPassword,
    newPassword,
    setNewPassword,
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword
}: SecuritySettingsProps) {
    function TabTitleComponent({ label }: { label: string }) {
        return <h3 className='text-[20px] text-[#002333] font-normal mb-4'>{label}</h3>
    }

    const getPasswordStrength = (password: string) => {
        let strengthScore = 0
        const checks = {
            length: password.length >= 8,
            upperLower: /[A-Z]/.test(password) && /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        }

        Object.values(checks).forEach(check => {
            if (check) strengthScore++
        })

        if (strengthScore <= 1) return { strength: 'Weak', color: 'text-red-500', checks }
        if (strengthScore <= 3) return { strength: 'Strong', color: 'text-[#667085]', checks }
        return { strength: 'Very Strong', color: 'text-green-600', checks }
    }

    const passwordStrength = getPasswordStrength(password)

    return (
        <div>
            <TabTitleComponent label='Login & Security' />
            <div className='space-y-6'>
                <div>
                    <Label htmlFor='password' className='text-sm font-normal text-[#344054]'>
                        Enter password
                    </Label>
                    <div className='relative mt-1'>
                        <Input
                            id='password'
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='pr-10 bg-gray-50 border-gray-200 text-[#667085]'
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-400' />
                            ) : (
                                <Eye className='h-4 w-4 text-gray-400' />
                            )}
                        </Button>
                    </div>
                </div>
                <div>
                    <div className='text-sm font-bold mb-2 text-[#667085]'>
                        Strength: <span className={passwordStrength.color}>{passwordStrength.strength}</span>
                    </div>
                    <div className='space-y-2 text-sm'>
                        <div className='flex items-center gap-2'>
                            {passwordStrength.checks.length ? (
                                <FaCircleCheck className='w-4 h-4 text-[#00ED27]' />
                            ) : (
                                <FaRegCircle className='w-4 h-4 text-gray-400' />
                            )}
                            <span className='text-neutral-600'>At least 8 characters</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            {passwordStrength.checks.upperLower ? (
                                <FaCircleCheck className='w-4 h-4 text-[#00ED27]' />
                            ) : (
                                <FaRegCircle className='w-4 h-4 text-gray-400' />
                            )}
                            <span className='text-neutral-600'>At least one uppercase and lowercase character</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            {passwordStrength.checks.number ? (
                                <FaCircleCheck className='w-4 h-4 text-[#00ED27]' />
                            ) : (
                                <FaRegCircle className='w-4 h-4 text-gray-400' />
                            )}
                            <span className='text-neutral-600'>At least one number</span>
                        </div>
                        <div className='flex items-center gap-2'>
                            {passwordStrength.checks.special ? (
                                <FaCircleCheck className='w-4 h-4 text-[#00ED27]' />
                            ) : (
                                <FaRegCircle className='w-4 h-4 text-gray-400' />
                            )}
                            <span className='text-neutral-600'>At least one special character</span>
                        </div>
                    </div>
                </div>
                <div>
                    <Label htmlFor='new-password' className='text-sm font-medium text-[#344054]'>
                        Confirm password
                    </Label>
                    <div className='relative mt-1'>
                        <Input
                            id='new-password'
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={`pr-10 ${password !== newPassword ? 'border-red-200 focus:border-red-300' : 'border-gray-200'}`}
                        />
                        <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? (
                                <EyeOff className='h-4 w-4 text-gray-400' />
                            ) : (
                                <Eye className='h-4 w-4 text-gray-400' />
                            )}
                        </Button>
                    </div>
                    {password !== newPassword && (
                        <div className='text-xs text-red-500 mt-1'>Password mis-match</div>
                    )}
                </div>
                <Button
                    className='bg-teal-600 hover:bg-teal-700 text-white px-8'
                    disabled={password !== newPassword || !passwordStrength.checks.length}
                >
                    Change password
                </Button>
            </div>
        </div>
    )
}

