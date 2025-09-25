'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Presets de configuración
const PRESETS = {
  test: { users: 10, clearExisting: true, dryRun: true, description: 'Datos de prueba mínimos' },
  small: { users: 25, clearExisting: false, dryRun: false, description: 'Dataset pequeño para desarrollo' },
  medium: { users: 50, clearExisting: false, dryRun: false, description: 'Dataset mediano para testing' },
  large: { users: 100, clearExisting: false, dryRun: false, description: 'Dataset grande para demo' },
  'production-safe': { users: 30, clearExisting: false, dryRun: true, description: 'Modo seguro (solo simulación)' }
};

interface SeedingResult {
  success: boolean;
  message: string;
  data?: {
    usersCreated: number;
    contractsCreated: number;
    reviewsCreated: number;
    errors: string[];
    config?: {
      freelancersCreated: number;
      clientsCreated: number;
      averageContractsPerFreelancer: number;
      reviewRate: string;
    };
  };
  timestamp: string;
}

export default function DatabaseSeedingPage() {
  const [config, setConfig] = useState({
    users: 20,
    clearExisting: false,
    dryRun: true
  });
  
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedingResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const applyPreset = (presetName: string) => {
    const preset = PRESETS[presetName as keyof typeof PRESETS];
    if (preset) {
      setConfig({
        users: preset.users,
        clearExisting: preset.clearExisting,
        dryRun: preset.dryRun
      });
      setSelectedPreset(presetName);
      setResult(null);
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return (
      <div className='p-8'>
        <Alert className='max-w-2xl'>
          <AlertDescription>
            ⚠️ La funcionalidad de seeding no está disponible en producción por seguridad.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-2'>🌱 Database Seeding</h1>
          <p className='text-gray-600'>Poblar la base de datos con datos de prueba realistas</p>
          
          <div className='mt-4'>
            <Badge variant='outline' className='mr-2'>🔧 Development Only</Badge>
            <Badge variant={config.dryRun ? 'secondary' : 'destructive'}>
              {config.dryRun ? '🔒 Safe Mode' : '⚠️ Will Modify Database'}
            </Badge>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Panel de Configuración */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Presets */}
              <div>
                <Label className='text-base font-medium mb-3 block'>Presets Rápidos</Label>
                <div className='grid grid-cols-1 gap-2'>
                  {Object.entries(PRESETS).map(([name, preset]) => (
                    <button
                      key={name}
                      onClick={() => applyPreset(name)}
                      className={`text-left p-3 rounded-lg border transition-colors ${
                        selectedPreset === name 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className='font-medium capitalize'>{name.replace('-', ' ')}</div>
                      <div className='text-sm text-gray-600'>{preset.description}</div>
                      <div className='text-xs text-gray-500 mt-1'>
                        {preset.users} usuarios • {preset.dryRun ? 'Dry run' : 'Real'} • {preset.clearExisting ? 'Clear first' : 'Keep existing'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Configuración Manual */}
              <div>
                <Label className='text-base font-medium mb-3 block'>Configuración Manual</Label>
                
                <div className='space-y-4'>
                  <div>
                    <Label htmlFor='users'>Número de usuarios</Label>
                    <Input
                      id='users'
                      type='number'
                      value={config.users}
                      onChange={(e) => {
                        setConfig({...config, users: parseInt(e.target.value) || 0});
                        setSelectedPreset('');
                      }}
                      min={1}
                      max={500}
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Se crearán ~40% freelancers y ~60% clientes
                    </p>
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label>Dry Run (Solo simulación)</Label>
                      <p className='text-xs text-gray-500'>No modificará la base de datos</p>
                    </div>
                    <Switch
                      checked={config.dryRun}
                      onCheckedChange={(checked) => {
                        setConfig({...config, dryRun: checked});
                        setSelectedPreset('');
                      }}
                    />
                  </div>

                  <div className='flex items-center justify-between'>
                    <div>
                      <Label>Limpiar datos existentes</Label>
                      <p className='text-xs text-gray-500'>⚠️ Eliminará datos de prueba recientes</p>
                    </div>
                    <Switch
                      checked={config.clearExisting}
                      onCheckedChange={(checked) => {
                        setConfig({...config, clearExisting: checked});
                        setSelectedPreset('');
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Estimaciones */}
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h4 className='font-medium mb-2'>Estimaciones</h4>
                <div className='text-sm space-y-1'>
                  <div>Freelancers: ~{Math.floor(config.users * 0.4)}</div>
                  <div>Clientes: ~{Math.floor(config.users * 0.6)}</div>
                  <div>Contratos: ~{Math.floor(config.users * 0.4 * 8)}</div>
                  <div>Reviews: ~{Math.floor(config.users * 0.4 * 8 * 0.8)}</div>
                </div>
              </div>

              <Button 
                onClick={handleSeed}
                disabled={isSeeding || config.users === 0}
                className='w-full'
                size='lg'
              >
                {isSeeding ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2' />
                    Seeding en progreso...
                  </>
                ) : (
                  <>
                    🌱 {config.dryRun ? 'Simular' : 'Ejecutar'} Seeding
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Panel de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className='space-y-4'>
                  <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                      {result.success ? '✅' : '❌'} {result.message}
                    </AlertDescription>
                  </Alert>

                  {result.success && result.data && (
                    <div className='space-y-4'>
                      {/* Estadísticas principales */}
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='text-center p-3 bg-blue-50 rounded-lg'>
                          <div className='text-2xl font-bold text-blue-600'>{result.data.usersCreated}</div>
                          <div className='text-sm text-blue-800'>Usuarios</div>
                        </div>
                        <div className='text-center p-3 bg-green-50 rounded-lg'>
                          <div className='text-2xl font-bold text-green-600'>{result.data.contractsCreated}</div>
                          <div className='text-sm text-green-800'>Contratos</div>
                        </div>
                        <div className='text-center p-3 bg-purple-50 rounded-lg'>
                          <div className='text-2xl font-bold text-purple-600'>{result.data.reviewsCreated}</div>
                          <div className='text-sm text-purple-800'>Reviews</div>
                        </div>
                      </div>

                      {/* Estadísticas detalladas */}
                      {result.data.config && (
                        <div className='bg-gray-50 p-4 rounded-lg'>
                          <h4 className='font-medium mb-2'>Detalles</h4>
                          <div className='text-sm space-y-1'>
                            <div>Freelancers creados: {result.data.config.freelancersCreated}</div>
                            <div>Clientes creados: {result.data.config.clientsCreated}</div>
                            <div>Promedio contratos/freelancer: {result.data.config.averageContractsPerFreelancer}</div>
                            <div>Tasa de reviews: {result.data.config.reviewRate}</div>
                          </div>
                        </div>
                      )}

                      {/* Errores */}
                      {result.data.errors && result.data.errors.length > 0 && (
                        <div>
                          <h4 className='font-medium mb-2 text-orange-600'>
                            ⚠️ Errores ({result.data.errors.length})
                          </h4>
                          <div className='max-h-32 overflow-y-auto bg-orange-50 p-3 rounded text-sm'>
                            {result.data.errors.slice(0, 10).map((error, i) => (
                              <div key={i} className='text-orange-800'>{error}</div>
                            ))}
                            {result.data.errors.length > 10 && (
                              <div className='text-orange-600'>... y {result.data.errors.length - 10} más</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className='text-xs text-gray-500'>
                    Completado: {new Date(result.timestamp).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className='text-center text-gray-500 py-8'>
                  <div className='text-4xl mb-2'>📊</div>
                  <p>Los resultados aparecerán aquí después del seeding</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card className='mt-6'>
          <CardHeader>
            <CardTitle>ℹ️ Información</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 text-sm'>
              <div>
                <h4 className='font-medium mb-2'>Datos Generados</h4>
                <ul className='list-disc list-inside space-y-1 text-gray-600'>
                  <li>Usuarios realistas con nombres y emails</li>
                  <li>Contratos con estado "released" para reviews</li>
                  <li>Reviews con distribución realista de ratings</li>
                  <li>Comentarios variados y realistas</li>
                  <li>Fechas distribuidas en los últimos 6 meses</li>
                </ul>
              </div>
              <div>
                <h4 className='font-medium mb-2'>Seguridad</h4>
                <ul className='list-disc list-inside space-y-1 text-gray-600'>
                  <li>Solo disponible en desarrollo</li>
                  <li>Modo Dry Run por defecto</li>
                  <li>Los wallets incluyen "_seed_" para identificación</li>
                  <li>Clear solo afecta datos de las últimas 24h</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}